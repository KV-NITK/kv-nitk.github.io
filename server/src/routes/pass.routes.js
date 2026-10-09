import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireStaff } from "../middleware/staff.middleware.js";
import {
  getMyPassesController,
  scanPassController,
} from "../controllers/pass.controller.js";

const router = express.Router();

router.get("/my-passes", requireAuth, getMyPassesController);
router.post("/scan", requireAuth, requireStaff, scanPassController);

export default router;
