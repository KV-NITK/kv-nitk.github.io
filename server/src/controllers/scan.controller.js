import { verifyScan, advanceTeamStep } from "../services/scan.service.js";

export const scanQrCode = async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode || typeof qrCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "QR code is required",
      });
    }

    // req.team.id comes from requireTeamAuth.
    const teamId = req.team.id;

    const result = await verifyScan(teamId, qrCode);

    if (result.code === "PATH_NOT_ASSIGNED") {
      return res.status(409).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("QR scan error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process QR scan",
    });
  }
};

export const advanceStep = async (req, res) => {
  try {
    const teamId = req.team.id;
    const { scanAttemptId } = req.body;

    const result = await advanceTeamStep(teamId, scanAttemptId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Advance step error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to advance team step",
    });
  }
};