import { getCashfree } from "../config/cashfree.js";
import crypto from "crypto";

export const createCashfreeOrder = async ({
    orderId,
    amount,
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    returnUrl,
    notifyUrl,
    idempotencyKey,
}) => {
    const request = {
        order_amount: Number(amount),
        order_currency: "INR",
        order_id: orderId,

        customer_details: {
            customer_id: customerId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
        },

        order_meta: {
            ...(returnUrl ? { return_url: returnUrl } : {}),
            ...(notifyUrl ? { notify_url: notifyUrl } : {}),
        },
    };

    try {
        const requestId = crypto.randomUUID();

        const response = await getCashfree().PGCreateOrder(
            request,
            requestId,
            idempotencyKey
        );

        return response.data;
    } catch (error) {
        console.error(
            "Cashfree order creation failed:",
            error.response?.data || error.message
        );

        throw new Error("Failed to create Cashfree order");
    }
};

export const getCashfreeOrder = async (orderId) => {
    try {
        const response = await getCashfree().PGFetchOrder(orderId);

        return response.data;
    } catch (error) {
        console.error(
            "Cashfree order fetch failed:",
            error.response?.data || error.message
        );

        throw new Error("Failed to fetch Cashfree order");
    }
};

export const getCashfreePayments = async (orderId) => {
    try {
        const response = await getCashfree().PGOrderFetchPayments(orderId);

        return response.data;
    } catch (error) {
        console.error(
            "Cashfree payment fetch failed:",
            error.response?.data || error.message
        );

        throw new Error("Failed to fetch Cashfree payment");
    }
};

export const verifyCashfreeWebhook = ({
    signature,
    rawBody,
    timestamp,
}) => {
    if (!signature) {
        throw new Error("Missing webhook signature");
    }

    if (!timestamp) {
        throw new Error("Missing webhook timestamp");
    }

    if (!rawBody) {
        throw new Error("Missing webhook raw body");
    }

    return getCashfree().PGVerifyWebhookSignature(
        signature,
        rawBody,
        timestamp
    );
};