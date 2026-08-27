import {
  reviewScanAttempt,
  applyScanProgress,
  assignPathToTeam,
} from "../services/coordinator.service.js";

// ==================================================
// STEP 2 — Review Scan
// ==================================================

export const reviewScan = async (req, res) => {
  try {
    const { scanId } = req.params;
    const { decision } = req.body;

    if (!scanId) {
      return res.status(400).json({
        success: false,
        message: "Scan ID is required",
      });
    }

    if (
      decision !== "accepted" &&
      decision !== "rejected"
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Decision must be either "accepted" or "rejected"',
      });
    }

    const result =
      await reviewScanAttempt(
        scanId,
        decision
      );

    if (!result.success) {
      if (
        result.code === "SCAN_NOT_FOUND"
      ) {
        return res.status(404).json(result);
      }

      if (
        result.code ===
        "SCAN_ALREADY_REVIEWED"
      ) {
        return res.status(409).json(result);
      }

      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error(
      "Coordinator review scan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to review scan attempt",
    });
  }
};


// ==================================================
// STEP 3 — Apply Progress
// ==================================================

export const applyProgress = async (
  req,
  res
) => {
  try {
    const { scanId } = req.params;

    if (!scanId) {
      return res.status(400).json({
        success: false,
        message: "Scan ID is required",
      });
    }

    const result =
      await applyScanProgress(scanId);

    if (!result.success) {
      switch (result.code) {
        case "SCAN_NOT_FOUND":
          return res.status(404).json(result);

        case "SCAN_NOT_ACCEPTED":
          return res.status(409).json(result);

        case "PROGRESS_ALREADY_APPLIED":
          return res.status(409).json(result);

        case "TEAM_NOT_FOUND":
          return res.status(404).json(result);

        default:
          return res.status(400).json(result);
      }
    }

    return res.json(result);
  } catch (error) {
    console.error(
      "Apply team progress error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to apply team progress",
    });
  }
};


// ==================================================
// STEP 5 � Assign Path
// ==================================================

export const assignTeamPath = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { pathId } = req.body;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Team ID is required",
      });
    }

    if (!pathId) {
      return res.status(400).json({
        success: false,
        message: "Path ID is required",
      });
    }

    const result = await assignPathToTeam(teamId, pathId);

    if (!result.success) {
      if (result.code === "TEAM_NOT_FOUND" || result.code === "PATH_NOT_FOUND") {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Assign team path error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign team path",
    });
  }
};

