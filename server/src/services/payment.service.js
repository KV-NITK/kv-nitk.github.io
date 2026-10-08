import crypto from "crypto";
import { supabase } from "../config/supabase.js";
import { claimCouponSlot, GOODIE_PRODUCT_ID, normalizeCouponCode, quoteOrder } from "./pricing.service.js";
import { PaymentError } from "./payment.error.js";
import { createCashfreeOrder, getCashfreePayments } from "./cashfree.service.js";
import { issuePassesForPayment } from "./pass.service.js";

// A CREATED order younger than this may still be getting its Cashfree session
const IN_FLIGHT_SECONDS = 60;

const paymentResult = (payment) => ({
    paymentId: payment.id,
    orderId: payment.provider_order_id,
    paymentSessionId: payment.provider_payment_session_id,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
});

const markFailed = async (paymentId, reason) => {
    const { error } = await supabase
        .from("payments")
        .update({
            status: "FAILED",
            failure_reason: reason,
            updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

    if (error) {
        console.error("Failed to mark payment as failed:", error);
    }
};

// productId -> quantity, with duplicate lines merged
const cartMap = (items) => {
    const map = new Map();

    for (const item of items || []) {
        const id = String(item.productId).trim();
        map.set(id, (map.get(id) || 0) + Number(item.quantity));
    }

    return map;
};

const sameCart = (existing, items, couponCode) => {
    // Orders stored before items were recorded cannot be compared
    if (!Array.isArray(existing.items)) {
        return true;
    }

    // The goodie is added by the server, so the client's cart never lists it
    const stored = cartMap(existing.items.filter((item) => item.productId !== GOODIE_PRODUCT_ID));
    const requested = cartMap(items);

    if (stored.size !== requested.size) {
        return false;
    }

    for (const [id, quantity] of requested) {
        if (stored.get(id) !== quantity) {
            return false;
        }
    }

    // A coupon that gave no discount is stored as null, so only compare when one was applied
    const storedCoupon = existing.coupon_code ?? null;

    return storedCoupon === null || storedCoupon === normalizeCouponCode(couponCode);
};

// Same idempotency key seen again: hand back the same order, but never for a
// different user, a different cart, or an order that can no longer be paid.
const replayExisting = (existing, { userIrisId, items, couponCode }) => {
    if (existing.user_iris_id !== userIrisId) {
        throw new PaymentError("Invalid payment request");
    }

    if (!sameCart(existing, items, couponCode)) {
        throw new PaymentError(
            "This checkout was already used for a different order. Please start a new checkout.",
            409
        );
    }

    // The first request of a double click is still talking to Cashfree
    const inFlight =
        existing.status === "CREATED" &&
        !existing.provider_payment_session_id &&
        Date.now() - new Date(existing.created_at).getTime() < IN_FLIGHT_SECONDS * 1000;

    if (inFlight) {
        throw new PaymentError(
            "This payment is already being created. Please wait a moment.",
            409
        );
    }

    const payable =
        existing.status === "SUCCESS" ||
        ((existing.status === "CREATED" || existing.status === "PENDING") &&
            existing.provider_payment_session_id);

    if (!payable) {
        throw new PaymentError(
            "This payment attempt is no longer valid. Please start a new checkout.",
            409
        );
    }

    return paymentResult(existing);
};

const findByIdempotencyKey = async (idempotencyKey) => {
    const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

    if (error) {
        throw new Error("Failed to check existing payment");
    }

    return data;
};

export const createPayment = async ({
    userIrisId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    couponCode = null,
    purpose = "STORE_ORDER",
    referenceId = null,
    returnUrl,
    idempotencyKey,
}) => {
    if (!idempotencyKey) {
        throw new PaymentError("Idempotency key is required");
    }

    if (!userIrisId) {
        throw new PaymentError("User identity is required", 401);
    }

    if (!customerName) {
        throw new PaymentError("Customer name is required");
    }

    if (!customerEmail) {
        throw new PaymentError("Customer email is required");
    }

    if (!customerPhone) {
        throw new PaymentError("Customer phone is required");
    }

    if (!purpose) {
        throw new PaymentError("Payment purpose is required");
    }

    const replayContext = { userIrisId, items, couponCode };

    const existingPayment = await findByIdempotencyKey(idempotencyKey);

    if (existingPayment) {
        return replayExisting(existingPayment, replayContext);
    }

    // The amount is always computed here, never taken from the client
    const quote = await quoteOrder({ items, couponCode, userIrisId });
    const amount = quote.total;

    const paymentId = crypto.randomUUID();
    const providerOrderId = `pay_${paymentId}`;

    const { error: insertError } = await supabase
        .from("payments")
        .insert({
            id: paymentId,
            user_iris_id: userIrisId,

            purpose,
            reference_id: referenceId,

            amount,
            currency: quote.currency,

            items: quote.items,
            subtotal_amount: quote.subtotal,
            discount_amount: quote.discount,
            coupon_code: quote.couponCode,

            provider: "CASHFREE",
            provider_order_id: providerOrderId,
            idempotency_key: idempotencyKey,

            status: "CREATED",

            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
        });

    if (insertError) {
        // Two requests with the same key at once: the loser returns the winner's order
        if (insertError.code === "23505") {
            const winner = await findByIdempotencyKey(idempotencyKey);

            if (winner) {
                return replayExisting(winner, replayContext);
            }
        }

        console.error("Failed to create payment record:", insertError);

        throw new Error("Failed to create payment");
    }

    try {
        if (quote.couponCode) {
            await claimCouponSlot({
                code: quote.couponCode,
                paymentId,
                userIrisId,
            });
        }

        const cashfreeOrder = await createCashfreeOrder({
            orderId: providerOrderId,
            amount,

            customerId: userIrisId,
            customerName,
            customerEmail,
            customerPhone,

            returnUrl,
            notifyUrl: process.env.CASHFREE_WEBHOOK_URL,

            idempotencyKey,
        });

        const { data: updatedPayment, error: updateError } = await supabase
            .from("payments")
            .update({
                provider_order_id: cashfreeOrder.order_id,
                provider_payment_session_id: cashfreeOrder.payment_session_id,

                // The order exists, but the user has NOT paid yet
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

        return paymentResult(updatedPayment);
    } catch (error) {
        // A failed attempt keeps its row (for the record) but is never reused:
        // replaying its key tells the client to start a new checkout.
        await markFailed(paymentId, error.message);

        throw error;
    }
};

const CASHFREE_STATUS_MAP = {
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    USER_DROPPED: "CANCELLED",
    CANCELLED: "CANCELLED",
    PENDING: "PENDING",
    NOT_ATTEMPTED: "PENDING",
};

const amountsMatch = (a, b) => Number(a).toFixed(2) === Number(b).toFixed(2);

const toPaymentView = (payment, status = payment.status) => ({
    paymentId: payment.id,
    orderId: payment.provider_order_id,
    status,
    amount: payment.amount,
    currency: payment.currency,
    items: payment.items ?? [],
    subtotal: payment.subtotal_amount ?? payment.amount,
    discount: payment.discount_amount ?? 0,
    couponCode: payment.coupon_code ?? null,
    paidAt: payment.paid_at ?? null,
    failureReason: payment.failure_reason ?? null,
    createdAt: payment.created_at ?? null,
});

// The user's own orders, newest first. Stored status only (no Cashfree calls):
// the page refreshes unfinished ones one by one through getPaymentStatus.
export const listUserPayments = async (userIrisId) => {
    const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_iris_id", userIrisId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Failed to list payments:", error);
        throw new Error("Failed to fetch orders");
    }

    return data.map((payment) => toPaymentView(payment));
};

/**
 * Status of one payment, for its owner. If the payment is not final yet,
 * Cashfree is asked directly (the webhook may not have arrived yet).
 * A SUCCESS is never downgraded.
 */
export const getPaymentStatus = async (paymentId, userIrisId) => {
    const { data: payment, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .maybeSingle();

    if (error) {
        console.error("Failed to fetch payment:", error);
        throw new Error("Failed to fetch payment");
    }

    // Same answer for "missing" and "someone else's" so ids cannot be probed
    if (!payment || payment.user_iris_id !== userIrisId) {
        throw new PaymentError("Payment not found", 404);
    }

    if (payment.status === "SUCCESS") {
        try {
            await issuePassesForPayment(payment.id);
        } catch (passErr) {
            console.error("Failed to issue passes in getPaymentStatus (already SUCCESS):", passErr);
        }
        return toPaymentView(payment);
    }

    if (!payment.provider_payment_session_id) {
        return toPaymentView(payment);
    }

    let cashfreePayments;

    try {
        cashfreePayments = await getCashfreePayments(payment.provider_order_id);
    } catch (err) {
        // Cashfree unreachable: show what we have, the webhook will catch up
        console.error("Status check failed, using stored status:", err.message);
        return toPaymentView(payment);
    }

    if (!Array.isArray(cashfreePayments) || cashfreePayments.length === 0) {
        return toPaymentView(payment);
    }

    // A successful attempt wins over any other attempt on the same order
    const successAttempt = cashfreePayments.find(
        (p) => p.payment_status === "SUCCESS"
    );

    const attempt =
        successAttempt ||
        cashfreePayments.find((p) => p.payment_status === "PENDING") ||
        cashfreePayments[cashfreePayments.length - 1];

    const newStatus =
        CASHFREE_STATUS_MAP[attempt.payment_status] ?? payment.status;

    if (newStatus === "SUCCESS" && !amountsMatch(attempt.payment_amount, payment.amount)) {
        console.error("Payment amount mismatch on status check:", {
            paymentId: payment.id,
            expected: payment.amount,
            got: attempt.payment_amount,
        });

        throw new Error("Payment amount mismatch");
    }

    if (newStatus === payment.status) {
        return toPaymentView(payment);
    }

    const updateData = {
        status: newStatus,
        provider_payment_id: attempt.cf_payment_id
            ? String(attempt.cf_payment_id)
            : payment.provider_payment_id,
        updated_at: new Date().toISOString(),
    };

    if (newStatus === "SUCCESS") {
        updateData.paid_at =
            attempt.payment_completion_time ||
            attempt.payment_time ||
            new Date().toISOString();
        updateData.failure_reason = null;
    }

    if (newStatus === "FAILED") {
        updateData.failure_reason = attempt.payment_message || "Payment failed";
    }

    // .neq guards against overwriting a SUCCESS written by the webhook meanwhile
    const { data: updated, error: updateError } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", payment.id)
        .neq("status", "SUCCESS")
        .select()
        .maybeSingle();

    if (updateError) {
        console.error("Failed to update payment status:", updateError);
        throw new Error("Failed to update payment status");
    }

    if (newStatus === "SUCCESS") {
        try {
            await issuePassesForPayment(payment.id);
        } catch (passErr) {
            console.error("Failed to issue passes in getPaymentStatus polling fallback:", passErr);
        }
    }

    return toPaymentView(updated ?? payment, updated ? newStatus : "SUCCESS");
};
