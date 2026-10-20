import express from "express";

import { limitRequests } from "../middleware/rateLimit.middleware.js";
import {
  getFlowersController,
  addFlowersController,
  startPlayController,
  getPlayController,
  guessController,
  hintController,
  setNameController,
  chartController,
} from "../controllers/parva26.controller.js";

// The Parva 2026 landing page games. No login: the limits are per client
// address, set high enough for a hostel or lab behind one address.
const router = express.Router();

const reads = limitRequests({ limit: 300, windowMs: 60_000 });
const writes = limitRequests({ limit: 300, windowMs: 60_000 });
const newGames = limitRequests({ limit: 200, windowMs: 60 * 60_000, message: "Too many new games from here. Please try later." });

router.get("/flowers", reads, getFlowersController);
router.post("/flowers", writes, addFlowersController);

router.post("/film/plays", newGames, startPlayController);
router.get("/film/plays/:playId", reads, getPlayController);
router.post("/film/plays/:playId/guess", writes, guessController);
router.post("/film/plays/:playId/hint", writes, hintController);
router.put("/film/plays/:playId/name", writes, setNameController);
router.get("/film/chart", reads, chartController);

export default router;
