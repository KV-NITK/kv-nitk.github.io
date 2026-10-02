import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createPaymentController,
  getPaymentController,
  listMyPaymentsController,
  listProductsController,
  quoteOrderController,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Public catalog
router.get("/products", listProductsController);

// Current user's orders
router.get("/", requireAuth, listMyPaymentsController);

router.post("/quote", requireAuth, quoteOrderController);

router.post("/", requireAuth, createPaymentController);

router.get("/:id", requireAuth, getPaymentController);

export default router;
