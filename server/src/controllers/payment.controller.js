import { createPaymentSchema } from "../validators/payment.validator.js";
import { createPayment } from "../services/payment.service.js";

export const createPaymentController = async (req, res) => {
  try {
    const result = createPaymentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment request",
        errors: result.error.flatten(),
      });
    }

    const { purpose, referenceId, amount, customerPhone } = result.data;

    const payment = await createPayment({
      userIrisId: req.user.irisId,
      customerName: req.user.name,
      customerEmail: req.user.email,

      customerPhone,

      amount,
      purpose,
      referenceId,

      returnUrl: process.env.CASHFREE_RETURN_URL,
    });

    return res.status(201).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Create payment controller error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment",
    });
  }
};