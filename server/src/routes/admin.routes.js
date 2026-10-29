import express from "express";

import { requireAdminPasscode, requireStaffAdminPasscode } from "../middleware/adminAuth.middleware.js";
import { listOrdersController } from "../controllers/admin.controller.js";
import {
  listStaffController,
  addStaffController,
  updateStaffController,
} from "../controllers/staff.controller.js";
import {
  staffActivityController,
  revertClaimController,
  addNoteController,
} from "../controllers/staffActivity.controller.js";
import {
  getInventoryController,
  setStockController,
  addSpotSaleController,
  undoSpotSaleController,
} from "../controllers/inventory.controller.js";

const router = express.Router();

// Event staff (scanner volunteers and admins). Needs the separate staff admin password.
router.get("/staff", requireStaffAdminPasscode, listStaffController);
router.post("/staff", requireStaffAdminPasscode, addStaffController);
router.patch("/staff/:irisId", requireStaffAdminPasscode, updateStaffController);

// What a staff member handed out, plus revert and notes on a pass. Same staff admin password.
router.get("/staff/:irisId/activity", requireStaffAdminPasscode, staffActivityController);
router.post("/passes/:passId/revert", requireStaffAdminPasscode, revertClaimController);
router.post("/passes/:passId/notes", requireStaffAdminPasscode, addNoteController);

// Merch stock and on-spot sales. Same staff admin password.
router.get("/inventory", requireStaffAdminPasscode, getInventoryController);
router.put("/inventory", requireStaffAdminPasscode, setStockController);
router.post("/inventory/spot-sales", requireStaffAdminPasscode, addSpotSaleController);
router.post("/inventory/spot-sales/:id/undo", requireStaffAdminPasscode, undoSpotSaleController);

// Every order, for the admin page. Needs the admin password.
router.get("/orders", requireAdminPasscode, listOrdersController);

export default router;
