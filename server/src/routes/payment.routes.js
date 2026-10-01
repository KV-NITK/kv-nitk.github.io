import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { createPaymentController } from "../controllers/payment.controller.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  createPaymentController
);

export default router;