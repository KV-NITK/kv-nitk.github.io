import {
  createPaymentSchema,
  quoteOrderSchema,
} from "../validators/payment.validator.js";
import {
  createPayment,
  getPaymentStatus,
  listUserPayments,
} from "../services/payment.service.js";
import { quoteOrder, listProducts } from "../services/pricing.service.js";
import { PaymentError } from "../services/payment.error.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sendError = (res, error, logLabel) => {
  if (error instanceof PaymentError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error(logLabel, error);

  // Internal details (DB / Cashfree errors) are not shown to the client
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
};

const sendInvalidRequest = (res, parsed) =>
  res.status(400).json({
    success: false,
    message: "Invalid payment request",
    errors: parsed.error.flatten(),
  });

// Price preview for the cart screen (does not create anything)
export const quoteOrderController = async (req, res) => {
  try {
    const parsed = quoteOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendInvalidRequest(res, parsed);
    }

    const { items, couponCode } = parsed.data;

    const quote = await quoteOrder({
      items,
      couponCode,
      userIrisId: req.user.irisId,
    });

    return res.json({ success: true, quote });
  } catch (error) {
    return sendError(res, error, "Quote order controller error:");
  }
};

export const createPaymentController = async (req, res) => {
  try {
    const parsed = createPaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendInvalidRequest(res, parsed);
    }

    const { items, couponCode, customerPhone, idempotencyKey } = parsed.data;

    const payment = await createPayment({
      userIrisId: req.user.irisId,
      customerName: req.user.name,
      customerEmail: req.user.email,

      customerPhone,

      items,
      couponCode,

      returnUrl: process.env.CASHFREE_RETURN_URL,
      idempotencyKey,
    });

    return res.status(201).json({
      success: true,
      payment,
    });
  } catch (error) {
    return sendError(res, error, "Create payment controller error:");
  }
};

export const listProductsController = async (req, res) => {
  try {
    const products = await listProducts();

    return res.json({ success: true, products });
  } catch (error) {
    return sendError(res, error, "List products controller error:");
  }
};

export const getPaymentController = async (req, res) => {
  try {
    if (!UUID_PATTERN.test(req.params.id)) {
      throw new PaymentError("Payment not found", 404);
    }

    const payment = await getPaymentStatus(req.params.id, req.user.irisId);

    return res.json({ success: true, payment });
  } catch (error) {
    return sendError(res, error, "Get payment controller error:");
  }
};

export const listMyPaymentsController = async (req, res) => {
  try {
    const payments = await listUserPayments(req.user.irisId);

    return res.json({ success: true, payments });
  } catch (error) {
    return sendError(res, error, "List my payments controller error:");
  }
};
