import express from "express";

import { requireAdminPasscode, requireStaffAdminPasscode } from "../middleware/adminAuth.middleware.js";
import { listOrdersController } from "../controllers/admin.controller.js";
import {
  listStaffController,
  addStaffController,
  updateStaffController,
} from "../controllers/staff.controller.js";

const router = express.Router();

// Event staff (scanner volunteers and admins). Needs the separate staff admin password.
router.get("/staff", requireStaffAdminPasscode, listStaffController);
router.post("/staff", requireStaffAdminPasscode, addStaffController);
router.patch("/staff/:irisId", requireStaffAdminPasscode, updateStaffController);

// Every order, for the admin page. Needs the admin password.
router.get("/orders", requireAdminPasscode, listOrdersController);

export default router;
