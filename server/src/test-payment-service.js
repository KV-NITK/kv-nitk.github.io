import "dotenv/config";

import { createPayment } from "./services/payment.service.js";

try {
  const payment = await createPayment({
    userIrisId: "TEST_IRIS_USER_001",

    customerName: "Test User",
    customerEmail: "test@example.com",
    customerPhone: "9999999999",

    amount: 1,

    purpose: "TEST",

    referenceId: "test-payment-001",

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