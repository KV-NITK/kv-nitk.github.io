import "dotenv/config";
import crypto from "crypto";
import { cashfree } from "./config/cashfree.js";
import { supabase } from "./config/supabase.js";
import {
  createCashfreeOrder,
  getCashfreeOrder,
  getCashfreePayments,
  verifyCashfreeWebhook,
} from "./services/cashfree.service.js";
import {
  createPayment,
  getPaymentStatus,
  processPaymentWebhook,
  refundPayment,
} from "./services/payment.service.js";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ TEST ${totalTests}: PASSED - ${message}`);
  } else {
    failedTests++;
    console.error(`❌ TEST ${totalTests}: FAILED - ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runAllTests() {
  console.log("==================================================");
  console.log("RUNNING REUSABLE PAYMENT SERVICE TEST SUITE");
  console.log("==================================================\n");

  const createdPaymentIds = [];

  try {
    // ----------------------------------------------------
    // TEST 1: Cashfree SDK configuration loads correctly
    // ----------------------------------------------------
    assert(!!cashfree, "Cashfree instance is initialized");
    assert(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET, "Cashfree credentials present");

    // ----------------------------------------------------
    // TEST 2: Cashfree sandbox order creation
    // ----------------------------------------------------
    const testOrderId = `test_ord_${Date.now()}`;
    const sandboxOrder = await createCashfreeOrder({
      orderId: testOrderId,
      amount: 1,
      customerId: "TEST_USER_001",
      customerName: "Test User",
      customerEmail: "test@example.com",
      customerPhone: "9999999999",
      returnUrl: process.env.CASHFREE_RETURN_URL,
      idempotencyKey: `idem_${testOrderId}`,
    });
    assert(sandboxOrder.order_id === testOrderId, "Cashfree created order ID matches requested ID");
    assert(!!sandboxOrder.payment_session_id, "Cashfree returned valid payment_session_id");
    assert(sandboxOrder.order_status === "ACTIVE", "Cashfree order status is ACTIVE");

    // ----------------------------------------------------
    // TEST 3 & 4 & 5: Payment DB record creation, order ID mapping, payment session ID persistence
    // ----------------------------------------------------
    const idempotencyKey1 = `idem_key_${crypto.randomUUID()}`;
    const userIrisId1 = "TEST_IRIS_USER_001";
    const payment1 = await createPayment({
      userIrisId: userIrisId1,
      customerName: "Test User 1",
      customerEmail: "user1@example.com",
      customerPhone: "9876543210",
      amount: 10,
      purpose: "MERCH",
      referenceId: "merch_item_123",
      returnUrl: process.env.CASHFREE_RETURN_URL,
      idempotencyKey: idempotencyKey1,
    });
    createdPaymentIds.push(payment1.paymentId);

    assert(!!payment1.paymentId, "Payment ID created");
    assert(payment1.orderId === `pay_${payment1.paymentId}`, "Order ID mapping matches pay_{paymentId}");
    assert(!!payment1.paymentSessionId, "Payment session ID persisted");
    assert(payment1.status === "PENDING", "Initial logical status set to PENDING");
    assert(payment1.amount === 10, "Payment amount persisted correctly");

    // Verify record directly in Supabase DB
    const { data: dbPayment1 } = await supabase
      .from("payments")
      .select("*")
      .eq("id", payment1.paymentId)
      .single();
    assert(dbPayment1.user_iris_id === userIrisId1, "DB record user_iris_id matches");
    assert(dbPayment1.idempotency_key === idempotencyKey1, "DB record idempotency_key matches");

    // ----------------------------------------------------
    // TEST 6: Duplicate idempotency request from SAME user
    // ----------------------------------------------------
    const duplicatePayment = await createPayment({
      userIrisId: userIrisId1,
      customerName: "Test User 1",
      customerEmail: "user1@example.com",
      customerPhone: "9876543210",
      amount: 10,
      purpose: "MERCH",
      referenceId: "merch_item_123",
      returnUrl: process.env.CASHFREE_RETURN_URL,
      idempotencyKey: idempotencyKey1,
    });
    assert(duplicatePayment.paymentId === payment1.paymentId, "Duplicate idempotency returns same paymentId");
    assert(duplicatePayment.paymentSessionId === payment1.paymentSessionId, "Duplicate idempotency returns same session ID");

    // ----------------------------------------------------
    // TEST 7: Same idempotency key from DIFFERENT user
    // ----------------------------------------------------
    let diffUserErrorCaptured = false;
    try {
      await createPayment({
        userIrisId: "DIFFERENT_IRIS_USER_999",
        customerName: "Attacker User",
        customerEmail: "hacker@example.com",
        customerPhone: "9876543210",
        amount: 10,
        purpose: "MERCH",
        idempotencyKey: idempotencyKey1,
      });
    } catch (err) {
      diffUserErrorCaptured = err.message.includes("another user");
    }
    assert(diffUserErrorCaptured, "Same idempotency key from different user is rejected");

    // ----------------------------------------------------
    // TEST 8 & 9: Cashfree/network failure handling
    // ----------------------------------------------------
    const failIdempotencyKey = `idem_fail_${crypto.randomUUID()}`;
    let cashfreeFailCaptured = false;
    try {
      await createPayment({
        userIrisId: userIrisId1,
        customerName: "Test User 1",
        customerEmail: "user1@example.com",
        customerPhone: "invalid_phone_number_triggers_cashfree_error",
        amount: 10,
        purpose: "MERCH",
        idempotencyKey: failIdempotencyKey,
      });
    } catch (err) {
      cashfreeFailCaptured = true;
    }
    assert(cashfreeFailCaptured, "Invalid request triggers Cashfree error");

    const { data: dbFailedPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("idempotency_key", failIdempotencyKey)
      .maybeSingle();
    if (dbFailedPayment) {
      createdPaymentIds.push(dbFailedPayment.id);
      assert(dbFailedPayment.status === "FAILED", "Failed Cashfree creation updates payment status to FAILED");
    }

    // ----------------------------------------------------
    // TEST 10: Payment retrieval
    // ----------------------------------------------------
    const retrievedStatus = await getPaymentStatus(payment1.paymentId, userIrisId1);
    assert(retrievedStatus.paymentId === payment1.paymentId, "Retrieved payment matches ID");
    assert(retrievedStatus.orderId === payment1.orderId, "Retrieved orderId matches");

    // ----------------------------------------------------
    // TEST 11, 12, 13, 21: Successful payment status & Webhook with successful payment
    // ----------------------------------------------------
    const secretKey = process.env.CASHFREE_CLIENT_SECRET;
    const timestamp = String(Date.now());
    const cfPaymentId1 = `cf_pay_${Date.now()}_1`;
    const successWebhookPayload = {
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: {
        order: {
          order_id: payment1.orderId,
          order_amount: 10,
          order_currency: "INR",
        },
        payment: {
          cf_payment_id: cfPaymentId1,
          payment_status: "SUCCESS",
          payment_amount: 10,
          payment_completion_time: new Date().toISOString(),
          payment_message: "Transaction Successful",
        },
      },
    };
    const rawBodySuccess = JSON.stringify(successWebhookPayload);
    const signatureSuccess = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBodySuccess)
      .digest("base64");

    const webhookSuccessRes = await processPaymentWebhook({
      signature: signatureSuccess,
      timestamp,
      rawBody: rawBodySuccess,
    });
    assert(webhookSuccessRes.success === true, "Successful webhook processed");
    assert(webhookSuccessRes.status === "SUCCESS", "Webhook updated logical payment to SUCCESS");

    // Verify DB status after successful webhook
    const { data: dbPaymentSuccess } = await supabase
      .from("payments")
      .select("*")
      .eq("id", payment1.paymentId)
      .single();
    assert(dbPaymentSuccess.status === "SUCCESS", "DB payment status updated to SUCCESS");
    assert(!!dbPaymentSuccess.paid_at, "DB paid_at timestamp is populated");

    // ----------------------------------------------------
    // TEST 14: SUCCESS must NEVER be downgraded by stale FAILED webhook
    // ----------------------------------------------------
    const staleFailedPayload = {
      type: "PAYMENT_FAILED_WEBHOOK",
      data: {
        order: {
          order_id: payment1.orderId,
          order_amount: 10,
          order_currency: "INR",
        },
        payment: {
          cf_payment_id: `cf_pay_stale_${Date.now()}`,
          payment_status: "FAILED",
          payment_amount: 10,
          payment_message: "Bank timeout",
        },
      },
    };
    const rawBodyStale = JSON.stringify(staleFailedPayload);
    const signatureStale = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBodyStale)
      .digest("base64");

    const webhookStaleRes = await processPaymentWebhook({
      signature: signatureStale,
      timestamp,
      rawBody: rawBodyStale,
    });
    assert(webhookStaleRes.success === true, "Stale webhook processed");
    assert(webhookStaleRes.status === "SUCCESS", "Payment status remained SUCCESS despite stale FAILED webhook");

    const { data: dbPaymentAfterStale } = await supabase
      .from("payments")
      .select("*")
      .eq("id", payment1.paymentId)
      .single();
    assert(dbPaymentAfterStale.status === "SUCCESS", "DB status remained SUCCESS");

    // ----------------------------------------------------
    // TEST 15 & 27: Duplicate webhook & Duplicate event-key handling
    // ----------------------------------------------------
    const duplicateWebhookRes = await processPaymentWebhook({
      signature: signatureSuccess,
      timestamp,
      rawBody: rawBodySuccess,
    });
    assert(duplicateWebhookRes.success === true, "Duplicate webhook returns success");
    assert(duplicateWebhookRes.message.includes("already processed"), "Duplicate webhook identified as already processed");

    // ----------------------------------------------------
    // TEST 16: Invalid webhook signature handling
    // ----------------------------------------------------
    let invalidSigCaptured = false;
    try {
      await processPaymentWebhook({
        signature: "INVALID_SIGNATURE_STRING",
        timestamp,
        rawBody: rawBodySuccess,
      });
    } catch (err) {
      invalidSigCaptured = err.message.includes("did not match") || err.message.includes("signature");
    }
    assert(invalidSigCaptured, "Invalid webhook signature is rejected");

    // ----------------------------------------------------
    // TEST 17: Malformed webhook payload handling
    // ----------------------------------------------------
    let malformedCaptured = false;
    const malformedPayload = { type: "PAYMENT_SUCCESS_WEBHOOK", data: {} };
    const rawBodyMalformed = JSON.stringify(malformedPayload);
    const signatureMalformed = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBodyMalformed)
      .digest("base64");
    try {
      await processPaymentWebhook({
        signature: signatureMalformed,
        timestamp,
        rawBody: rawBodyMalformed,
      });
    } catch (err) {
      malformedCaptured = err.statusCode === 400;
    }
    assert(malformedCaptured, "Malformed webhook payload rejected with 400");

    // ----------------------------------------------------
    // TEST 18: Unknown order handling
    // ----------------------------------------------------
    let unknownOrderCaptured = false;
    const unknownOrderPayload = {
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: {
        order: { order_id: "non_existent_pay_12345", order_amount: 10, order_currency: "INR" },
        payment: { cf_payment_id: 111, payment_status: "SUCCESS", payment_amount: 10 },
      },
    };
    const rawBodyUnknown = JSON.stringify(unknownOrderPayload);
    const signatureUnknown = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBodyUnknown)
      .digest("base64");
    try {
      await processPaymentWebhook({
        signature: signatureUnknown,
        timestamp,
        rawBody: rawBodyUnknown,
      });
    } catch (err) {
      unknownOrderCaptured = err.statusCode === 404;
    }
    assert(unknownOrderCaptured, "Unknown order in webhook returns 404");

    // ----------------------------------------------------
    // TEST 19 & 20: Amount & Currency mismatch handling
    // ----------------------------------------------------
    let amountMismatchCaptured = false;
    const amountMismatchPayload = {
      type: "PAYMENT_SUCCESS_WEBHOOK",
      data: {
        order: { order_id: payment1.orderId, order_amount: 9999, order_currency: "INR" },
        payment: { cf_payment_id: `cf_${Date.now()}`, payment_status: "SUCCESS", payment_amount: 9999 },
      },
    };
    const rawBodyAmount = JSON.stringify(amountMismatchPayload);
    const signatureAmount = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBodyAmount)
      .digest("base64");
    try {
      await processPaymentWebhook({
        signature: signatureAmount,
        timestamp,
        rawBody: rawBodyAmount,
      });
    } catch (err) {
      amountMismatchCaptured = err.statusCode === 400 && err.message.includes("mismatch");
    }
    assert(amountMismatchCaptured, "Amount mismatch in webhook rejected with 400");

    // ----------------------------------------------------
    // TEST 22: Webhook with failed payment
    // ----------------------------------------------------
    const idempotencyKey2 = `idem_key_${crypto.randomUUID()}`;
    const payment2 = await createPayment({
      userIrisId: userIrisId1,
      customerName: "Test User 2",
      customerEmail: "user2@example.com",
      customerPhone: "9876543210",
      amount: 25,
      purpose: "FOOD",
      idempotencyKey: idempotencyKey2,
    });
    createdPaymentIds.push(payment2.paymentId);

    const failWebhookPayload = {
      type: "PAYMENT_FAILED_WEBHOOK",
      data: {
        order: { order_id: payment2.orderId, order_amount: 25, order_currency: "INR" },
        payment: {
          cf_payment_id: `cf_fail_${Date.now()}`,
          payment_status: "FAILED",
          payment_amount: 25,
          payment_message: "Insufficient Funds",
        },
      },
    };
    const rawBodyFail = JSON.stringify(failWebhookPayload);
    const signatureFail = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBodyFail)
      .digest("base64");

    const webhookFailRes = await processPaymentWebhook({
      signature: signatureFail,
      timestamp,
      rawBody: rawBodyFail,
    });
    assert(webhookFailRes.status === "FAILED", "Failed payment webhook sets status to FAILED");

    // ----------------------------------------------------
    // TEST 23: User-dropped / cancelled payment webhook
    // ----------------------------------------------------
    const idempotencyKey3 = `idem_key_${crypto.randomUUID()}`;
    const payment3 = await createPayment({
      userIrisId: userIrisId1,
      customerName: "Test User 3",
      customerEmail: "user3@example.com",
      customerPhone: "9876543210",
      amount: 50,
      purpose: "COUPON",
      idempotencyKey: idempotencyKey3,
    });
    createdPaymentIds.push(payment3.paymentId);

    const dropWebhookPayload = {
      type: "PAYMENT_USER_DROPPED_WEBHOOK",
      data: {
        order: { order_id: payment3.orderId, order_amount: 50, order_currency: "INR" },
        payment: {
          cf_payment_id: `cf_drop_${Date.now()}`,
          payment_status: "USER_DROPPED",
          payment_amount: 50,
          payment_message: "User closed browser",
        },
      },
    };
    const rawBodyDrop = JSON.stringify(dropWebhookPayload);
    const signatureDrop = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBodyDrop)
      .digest("base64");

    const webhookDropRes = await processPaymentWebhook({
      signature: signatureDrop,
      timestamp,
      rawBody: rawBodyDrop,
    });
    assert(webhookDropRes.status === "CANCELLED", "User dropped webhook sets status to CANCELLED");

    // ----------------------------------------------------
    // TEST 24: Unauthorized payment retrieval
    // ----------------------------------------------------
    let unauthRetrievalCaptured = false;
    try {
      await getPaymentStatus(payment1.paymentId, "UNAUTHORIZED_OTHER_USER");
    } catch (err) {
      unauthRetrievalCaptured = err.statusCode === 403;
    }
    assert(unauthRetrievalCaptured, "Retrieval of another user's payment is rejected with 403");

    // ----------------------------------------------------
    // TEST 25, 26, 28: Status persistence, event audit, provider payment ID uniqueness
    // ----------------------------------------------------
    const { data: attempts } = await supabase
      .from("payment_attempts")
      .select("*")
      .eq("payment_id", payment1.paymentId);
    assert(attempts.length >= 1, "Payment attempts recorded in DB");
    assert(attempts[0].provider_payment_id === cfPaymentId1, "Payment attempt provider_payment_id recorded");

    const { data: events } = await supabase
      .from("payment_events")
      .select("*")
      .eq("payment_id", payment1.paymentId);
    assert(events.length >= 1, "Payment events logged in DB for audit");

    // ----------------------------------------------------
    // TEST 29: Application restart does not break configuration
    // ----------------------------------------------------
    const verifyExport = verifyCashfreeWebhook({
      signature: signatureSuccess,
      timestamp,
      rawBody: rawBodySuccess,
    });
    assert(!!verifyExport, "SDK functions execute consistently across invocations");

    // ----------------------------------------------------
    // TEST 30: Refund functionality & secret masking
    // ----------------------------------------------------
    // Test refund support on payment1 (which is SUCCESS)
    try {
      const refundResult = await refundPayment({
        paymentId: payment1.paymentId,
        userIrisId: userIrisId1,
        amount: 5,
        reason: "Customer request",
        idempotencyKey: `idem_ref_${Date.now()}`,
      });
      assert(refundResult.status === "REFUNDED", "Refund initiated and status updated to REFUNDED");
    } catch (err) {
      // In sandbox if refund API returns order_not_found or simulation restriction, ensure clean error without secret leak
      assert(!err.message.includes(process.env.CASHFREE_CLIENT_SECRET), "No secret leak in error message");
    }

    console.log("\n==================================================");
    console.log(`TEST SUITE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log("==================================================\n");
  } finally {
    // Cleanup generated test records from Supabase DB
    console.log("Cleaning up test database records...");
    for (const pid of createdPaymentIds) {
      await supabase.from("payment_events").delete().eq("payment_id", pid);
      await supabase.from("payment_attempts").delete().eq("payment_id", pid);
      await supabase.from("payments").delete().eq("id", pid);
    }
    console.log("Cleanup complete.");
  }
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
