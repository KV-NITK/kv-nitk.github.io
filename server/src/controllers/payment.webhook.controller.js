import { supabase } from "../config/supabase.js";
import { verifyCashfreeWebhook } from "../services/cashfree.service.js";

const PAYMENT_WEBHOOK_TYPES = new Set([
  "PAYMENT_SUCCESS_WEBHOOK",
  "PAYMENT_FAILED_WEBHOOK",
  "PAYMENT_USER_DROPPED_WEBHOOK",
]);

const amountsMatch = (a, b) => {
  return Number(a).toFixed(2) === Number(b).toFixed(2);
};

export const cashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = req.rawBody;

    // -----------------------------------------
    // 1. Verify Cashfree signature
    // -----------------------------------------

    const verification = verifyCashfreeWebhook({
      signature,
      rawBody,
      timestamp,
    });

    const event =
      verification?.object ||
      JSON.parse(rawBody);

    // -----------------------------------------
    // 2. Ignore webhook types we don't handle yet
    // -----------------------------------------

    if (!PAYMENT_WEBHOOK_TYPES.has(event.type)) {
      return res.status(200).json({
        success: true,
        message: "Webhook ignored",
      });
    }

    const orderId = event?.data?.order?.order_id;
    const orderAmount = event?.data?.order?.order_amount;
    const orderCurrency = event?.data?.order?.order_currency;

    const providerPaymentId =
      event?.data?.payment?.cf_payment_id;

    const paymentStatus =
      event?.data?.payment?.payment_status;

    const paymentAmount =
      event?.data?.payment?.payment_amount;

    if (
      !orderId ||
      !providerPaymentId ||
      !paymentStatus ||
      paymentAmount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment webhook payload",
      });
    }

    // -----------------------------------------
    // 3. Find our payment
    // -----------------------------------------

    const { data: payment, error: paymentFetchError } =
      await supabase
        .from("payments")
        .select("*")
        .eq("provider_order_id", orderId)
        .maybeSingle();

    if (paymentFetchError) {
      console.error(
        "Failed to find payment:",
        paymentFetchError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to process webhook",
      });
    }

    if (!payment) {
      console.error(
        "Payment not found for Cashfree order:",
        orderId
      );

      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // -----------------------------------------
    // 4. Validate amount and currency
    // -----------------------------------------

    if (
      !amountsMatch(payment.amount, paymentAmount) ||
      !amountsMatch(payment.amount, orderAmount) ||
      payment.currency !== orderCurrency
    ) {
      console.error("Payment amount/currency mismatch:", {
        paymentId: payment.id,
        expectedAmount: payment.amount,
        webhookPaymentAmount: paymentAmount,
        webhookOrderAmount: orderAmount,
        expectedCurrency: payment.currency,
        webhookCurrency: orderCurrency,
      });

      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
      });
    }

    // -----------------------------------------
    // 5. Determine our normalized status
    // -----------------------------------------

    let newStatus = payment.status;

    if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
      newStatus = "SUCCESS";
    }

    if (
      event.type === "PAYMENT_FAILED_WEBHOOK" &&
      payment.status !== "SUCCESS"
    ) {
      newStatus = "FAILED";
    }

    if (
      event.type === "PAYMENT_USER_DROPPED_WEBHOOK" &&
      payment.status !== "SUCCESS"
    ) {
      newStatus = "CANCELLED";
    }

    // -----------------------------------------
    // 6. Prepare payment update
    // -----------------------------------------

    const updateData = {
      provider_payment_id:
        payment.status === "SUCCESS"
          ? payment.provider_payment_id
          : String(providerPaymentId),

      updated_at: new Date().toISOString(),
    };

    if (newStatus !== payment.status) {
      updateData.status = newStatus;
    }

    if (newStatus === "SUCCESS") {
      updateData.paid_at =
        event?.data?.payment?.payment_completion_time ||
        event?.data?.payment?.payment_time ||
        new Date().toISOString();

      updateData.failure_reason = null;
    }

    if (newStatus === "FAILED") {
      updateData.failure_reason =
        event?.data?.payment?.payment_message ||
        "Payment failed";
    }

    // -----------------------------------------
    // 7. Update our payment
    // -----------------------------------------

    const { error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", payment.id);

    if (updateError) {
      console.error(
        "Failed to update payment:",
        updateError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update payment",
      });
    }

    // -----------------------------------------
    // 8. Record webhook event
    // -----------------------------------------

    const providerEventKey =
      `${event.type}:${providerPaymentId}`;

    const { error: eventError } = await supabase
      .from("payment_events")
      .insert({
        payment_id: payment.id,
        event_type: event.type,
        provider_event_key: providerEventKey,
        payload: event,
      });

    // Duplicate webhook
    if (eventError?.code === "23505") {
      return res.status(200).json({
        success: true,
        message: "Webhook already processed",
      });
    }

    if (eventError) {
      console.error(
        "Failed to store payment event:",
        eventError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to store payment event",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Cashfree webhook error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid webhook",
    });
  }
};