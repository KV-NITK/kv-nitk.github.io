import crypto from "crypto";
import { supabase } from "../config/supabase.js";
import { createCashfreeOrder } from "./cashfree.service.js";
import {
    createCashfreeOrder,
    getCashfreeOrder,
    getCashfreePayments,
} from "./cashfree.service.js";

export const createPayment = async ({
    userIrisId,
    customerName,
    customerEmail,
    customerPhone,
    amount,
    purpose,
    referenceId = null,
    returnUrl,
    idempotencyKey,
}) => {
    // -----------------------------------------
    // 1. Basic validation
    // -----------------------------------------

    if (!idempotencyKey) {
        throw new Error("Idempotency key is required");
    }

    if (!userIrisId) {
        throw new Error("User identity is required");
    }

    if (!customerName) {
        throw new Error("Customer name is required");
    }

    if (!customerEmail) {
        throw new Error("Customer email is required");
    }

    if (!customerPhone) {
        throw new Error("Customer phone is required");
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Invalid payment amount");
    }

    if (!purpose) {
        throw new Error("Payment purpose is required");
    }

    // -----------------------------------------
    // 2. Create our internal payment ID
    // -----------------------------------------
    const { data: existingPayment, error: existingPaymentError } =
        await supabase
            .from("payments")
            .select("*")
            .eq("idempotency_key", idempotencyKey)
            .maybeSingle();

    if (existingPaymentError) {
        throw new Error("Failed to check existing payment");
    }

    if (existingPayment) {
        if (existingPayment.user_iris_id !== userIrisId) {
            throw new Error("Invalid payment request");
        }

        return {
            paymentId: existingPayment.id,
            orderId: existingPayment.provider_order_id,
            paymentSessionId:
                existingPayment.provider_payment_session_id,
            status: existingPayment.status,
            amount: existingPayment.amount,
            currency: existingPayment.currency,
        };
    }

    const paymentId = crypto.randomUUID();

    // Cashfree order ID
    const providerOrderId = `pay_${paymentId}`;

    // -----------------------------------------
    // 3. Create payment record in our database
    // -----------------------------------------

    const { data: payment, error: insertError } = await supabase
        .from("payments")
        .insert({
            id: paymentId,
            user_iris_id: userIrisId,

            purpose,
            reference_id: referenceId,

            amount: Number(amount),
            currency: "INR",

            provider: "CASHFREE",
            provider_order_id: providerOrderId,
            idempotency_key: idempotencyKey,

            status: "CREATED",

            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
        })
        .select()
        .single();

    if (insertError) {
        console.error("Failed to create payment record:", insertError);

        throw new Error("Failed to create payment");
    }

    // -----------------------------------------
    // 4. Create Cashfree order
    // -----------------------------------------

    try {
        const cashfreeOrder = await createCashfreeOrder({
            orderId: providerOrderId,

            amount: Number(amount),

            customerId: userIrisId,
            customerName,
            customerEmail,
            customerPhone,

            returnUrl,
            notifyUrl: process.env.CASHFREE_WEBHOOK_URL,

            idempotencyKey,
        });

        // -----------------------------------------
        // 5. Save Cashfree response in our DB
        // -----------------------------------------

        const { data: updatedPayment, error: updateError } = await supabase
            .from("payments")
            .update({
                provider_order_id: cashfreeOrder.order_id,
                provider_payment_session_id:
                    cashfreeOrder.payment_session_id,

                // Order exists, but user has NOT paid yet.
                status: "PENDING",

                updated_at: new Date().toISOString(),
            })
            .eq("id", paymentId)
            .select()
            .single();

        if (updateError) {
            console.error(
                "Payment created but failed to update Cashfree details:",
                updateError
            );

            throw new Error(
                "Payment was created but payment details could not be stored"
            );
        }

        // -----------------------------------------
        // 6. Return only what application needs
        // -----------------------------------------

        return {
            paymentId: updatedPayment.id,
            orderId: updatedPayment.provider_order_id,
            paymentSessionId:
                updatedPayment.provider_payment_session_id,
            status: updatedPayment.status,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency,
        };
    } catch (error) {
        // -----------------------------------------
        // 7. Cashfree failed
        // -----------------------------------------

        await supabase
            .from("payments")
            .update({
                status: "FAILED",
                failure_reason: error.message,
                updated_at: new Date().toISOString(),
            })
            .eq("id", paymentId);

        throw error;
    }
};

export const getPaymentStatus = async (paymentId) => {
    // 1. Find our payment
    const { data: payment, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .maybeSingle();

    if (error) {
        console.error("Failed to fetch payment:", error);
        throw new Error("Failed to fetch payment");
    }

    if (!payment) {
        throw new Error("Payment not found");
    }

    // 2. Ask Cashfree about the provider order
    const cashfreePayments = await getCashfreePayments(
        payment.provider_order_id
    );

    // 3. No actual payment attempt yet
    if (!cashfreePayments || cashfreePayments.length === 0) {
        return {
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
        };
    }

    // 4. Find the most relevant payment
    const latestPayment = cashfreePayments[cashfreePayments.length - 1];

    const cashfreeStatus = latestPayment.payment_status;

    let normalizedStatus = payment.status;

    switch (cashfreeStatus) {
        case "SUCCESS":
            normalizedStatus = "SUCCESS";
            break;

        case "FAILED":
            normalizedStatus = "FAILED";
            break;

        case "USER_DROPPED":
            normalizedStatus = "CANCELLED";
            break;

        case "PENDING":
            normalizedStatus = "PENDING";
            break;

        default:
            normalizedStatus = payment.status;
    }

    // 5. Update our DB if the status changed
    if (normalizedStatus !== payment.status) {
        const updateData = {
            status: normalizedStatus,
            updated_at: new Date().toISOString(),
        };

        if (normalizedStatus === "SUCCESS") {
            updateData.paid_at =
                latestPayment.payment_completion_time ||
                latestPayment.payment_time ||
                new Date().toISOString();
        }

        if (normalizedStatus === "FAILED") {
            updateData.failure_reason =
                latestPayment.payment_message || "Payment failed";
        }

        await supabase
            .from("payments")
            .update(updateData)
            .eq("id", payment.id);
    }

    return {
        paymentId: payment.id,
        orderId: payment.provider_order_id,
        status: normalizedStatus,
        amount: payment.amount,
        currency: payment.currency,
    };
};