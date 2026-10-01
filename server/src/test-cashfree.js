import { randomUUID } from "crypto";
import { createCashfreeOrder } from "./services/cashfree.service.js";

const orderId = `pay_${randomUUID()}`;

try {
  const order = await createCashfreeOrder({
    orderId,
    amount: 1,
    customerId: "test-user-001",
    customerName: "Test User",
    customerEmail: "test@example.com",
    customerPhone: "9999999999",
    returnUrl: process.env.CASHFREE_RETURN_URL,
  });

  console.log("Cashfree order created successfully:");
  console.log({
    orderId: order.order_id,
    paymentSessionId: order.payment_session_id,
    orderStatus: order.order_status,
  });
} catch (error) {
  console.error("Cashfree test failed:", error.message);
  process.exit(1);
}