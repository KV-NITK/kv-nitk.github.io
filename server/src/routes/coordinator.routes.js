import express from "express";

import {
  reviewScan,
  applyProgress,
  assignTeamPath,
} from "../controllers/coordinator.controller.js";

import {
  requireCoordinatorAuth,
} from "../middleware/coordinatorAuth.middleware.js";

const router = express.Router();

// Step 2
router.patch(
  "/scans/:scanId",
  requireCoordinatorAuth,
  reviewScan
);

// Step 3
router.post(
  "/scans/:scanId/apply-progress",
  requireCoordinatorAuth,
  applyProgress
);

// Step 5
router.patch(
  "/teams/:teamId/path",
  requireCoordinatorAuth,
  assignTeamPath
);

export default router;

