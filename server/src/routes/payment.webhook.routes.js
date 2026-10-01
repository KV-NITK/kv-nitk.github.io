import express from "express";
import { cashfreeWebhook } from "../controllers/payment.webhook.controller.js";

const router = express.Router();

router.post(
  "/",
  express.json({
    type: ["application/json", "text/plain", "*/*"],
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  }),
  cashfreeWebhook
);

export default router;