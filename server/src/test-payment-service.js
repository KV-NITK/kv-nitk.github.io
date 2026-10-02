import "dotenv/config";

import { createPayment } from "./services/payment.service.js";

try {
  const payment = await createPayment({
    userIrisId: "TEST_IRIS_USER_001",

    customerName: "Test User",
    customerEmail: "test@example.com",
    customerPhone: "9999999999",

    // Needs a row in payment_products (see sql/create_payment_catalog.sql)
    items: [{ productId: process.env.TEST_PRODUCT_ID, quantity: 1 }],
    couponCode: process.env.TEST_COUPON_CODE || null,

    idempotencyKey: `test-${Date.now()}`,

    returnUrl: process.env.CASHFREE_RETURN_URL,
  });

  console.log("\nPayment created successfully:\n");

  console.log(payment);

  process.exit(0);
} catch (error) {
  console.error("\nPayment creation failed:\n");
  console.error(error.message);

  process.exit(1);
}