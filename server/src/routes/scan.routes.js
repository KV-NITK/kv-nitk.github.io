import express from "express";

import { scanQrCode } from "../controllers/scan.controller.js";
import { requireTeamAuth } from "../middleware/teamAuth.middleware.js";

const router = express.Router();

/*
 * Team must be logged in.
 * Team identity comes from the HTTP-only
 * team_session_id cookie.
 */
router.post("/", requireTeamAuth, scanQrCode);

export default router;