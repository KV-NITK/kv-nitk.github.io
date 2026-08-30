import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getMyFeedback,
  submitFeedback,
  getTeamFeedbackList,
  getFeedbackList,
  getPublicFeedbackResponses,
} from "../controllers/feedback.controller.js";

const router = express.Router();

// Passcode protected public feedback list (raama-raama)
router.get("/public-list", getPublicFeedbackResponses);

// Get logged-in user's submission
router.get("/me", requireAuth, getMyFeedback);

// Submit or update user's feedback
router.post("/", requireAuth, submitFeedback);

// Get team's feedback responses (by teamId)
router.get("/team/:teamId", requireAuth, getTeamFeedbackList);

// Get all feedback (coordinator / admin)
router.get("/", requireAuth, getFeedbackList);

export default router;
