import { Router } from "express";
import { getGameState, scanQrCode } from "../controllers/game.controller.js";
import { requireTeamAuth } from "../middleware/teamAuth.middleware.js";

const router = Router();

router.get("/state", requireTeamAuth, getGameState);
router.post("/scan", requireTeamAuth, scanQrCode);

export default router;
