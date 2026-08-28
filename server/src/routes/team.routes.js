import express from "express";

import {
  registerTeam,
  getMyTeam,
  deleteMyTeam,
  getAllRegisteredTeamsPublic,
  getTeamGameStateController,
  getLeaderboardController,
} from "../controllers/team.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

import {
  teamLogin,
  getTeamMe,
  teamLogout,
} from "../controllers/team-auth.controller.js";

import { requireTeamAuth } from "../middleware/teamAuth.middleware.js";

const router = express.Router();

router.get("/public-list", getAllRegisteredTeamsPublic);
router.get("/list-of-members", getAllRegisteredTeamsPublic);
router.get("/leaderboard", getLeaderboardController);

router.get("/my-team", requireAuth, getMyTeam);
router.delete("/my-team", requireAuth, deleteMyTeam);

router.post("/register", requireAuth, registerTeam);

router.post("/login", teamLogin);

router.get("/me", requireTeamAuth, getTeamMe);
router.get("/game-state", requireTeamAuth, getTeamGameStateController);

router.post("/logout", requireTeamAuth, teamLogout);

export default router;