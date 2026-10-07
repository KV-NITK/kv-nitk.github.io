import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
  irisLogin,
  irisCallback,
  getMe,
  logout,
  devLogin,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/iris", irisLogin);
router.get("/iris/callback", irisCallback);
router.get("/me", requireAuth, getMe);
router.post("/logout", requireAuth, logout);

if (process.env.NODE_ENV !== "production") {
  router.get("/dev-login", devLogin);
}

export default router;