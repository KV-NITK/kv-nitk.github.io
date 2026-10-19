import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireStaff } from "../middleware/staff.middleware.js";
import {
  getMyPassesController,
  scanPassController,
  staffMeController,
  searchPassesController,
  revertPassController,
} from "../controllers/pass.controller.js";

const router = express.Router();

router.get("/my-passes", requireAuth, getMyPassesController);
router.get("/staff/me", requireAuth, requireStaff, staffMeController);
router.post("/scan", requireAuth, requireStaff, scanPassController);
router.get("/search", requireAuth, requireStaff, searchPassesController);
router.post("/revert", requireAuth, requireStaff, revertPassController);

export default router;
