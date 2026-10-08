import express from "express";

import { requireAdminPasscode } from "../middleware/adminAuth.middleware.js";
import { listOrdersController } from "../controllers/admin.controller.js";

const router = express.Router();

// Every order, for the admin page. Needs the admin password.
router.get("/orders", requireAdminPasscode, listOrdersController);

export default router;
