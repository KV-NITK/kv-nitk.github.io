import express from "express";
import { requireBoothPasscode } from "../middleware/adminAuth.middleware.js";
import { boothMeController, boothScanController, boothSearchController } from "../controllers/booth.controller.js";

const router = express.Router();

router.use(requireBoothPasscode);

router.get("/me", boothMeController);
router.post("/scan", boothScanController);
router.get("/search", boothSearchController);

export default router;
