import express from "express";

import {
  registerTeam,
  getMyTeam,
  deleteMyTeam,
  getAllRegisteredTeamsPublic,
} from "../controllers/team.controller.js";

const router = express.Router();

router.get("/public-list", getAllRegisteredTeamsPublic);
router.get("/list-of-members", getAllRegisteredTeamsPublic);

router.get("/my-team", requireAuth, getMyTeam);
router.delete("/my-team", requireAuth, deleteMyTeam);

router.post("/register", requireAuth, registerTeam);

router.post("/login", teamLogin);

router.get("/me", requireTeamAuth, getTeamMe);

router.post("/logout", requireTeamAuth, teamLogout);

export default router;