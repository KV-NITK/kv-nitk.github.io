import { supabase } from "../config/supabase.js";

/*
 * Step 2:
 * Coordinator reviews a scan attempt and marks it
 * as accepted or rejected.
 *
 * Step 3:
 * Apply team progress after an accepted scan.
 *
 * IMPORTANT:
 * - Step 2 only changes scan status.
 * - Step 3 uses a PostgreSQL RPC transaction.
 * - Score and current_step_no are updated atomically.
 * - The same scan cannot update progress twice.
 */

// ==================================================
// STEP 2 — Coordinator Review
// ==================================================

export const reviewScanAttempt = async (
  scanAttemptId,
  decision
) => {
  // --------------------------------------------------
  // 1. Validate decision
  // --------------------------------------------------

  if (
    decision !== "accepted" &&
    decision !== "rejected"
  ) {
    throw new Error(
      "Decision must be either accepted or rejected"
    );
  }

  // --------------------------------------------------
  // 2. Find scan attempt
  // --------------------------------------------------

  const {
    data: scanAttempt,
    error: fetchError,
  } = await supabase
    .from("scan_attempts")
    .select(`
      "scan-attempts_id",
      team_id,
      step_no,
      scanned_qr_code,
      scanned_location_id,
      expected_location_id,
      is_correct,
      points,
      scanned_at,
      path_step_id,
      status,
      progress_applied
    `)
    .eq(
      "scan-attempts_id",
      scanAttemptId
    )
    .maybeSingle();

  if (fetchError) {
    console.error(
      "Fetch scan attempt error:",
      fetchError
    );

    throw new Error(
      "Failed to fetch scan attempt"
    );
  }

  if (!scanAttempt) {
    return {
      success: false,
      code: "SCAN_NOT_FOUND",
      message: "Scan attempt not found",
    };
  }

  // --------------------------------------------------
  // 3. Only scanned attempts can be reviewed
  // --------------------------------------------------

  if (scanAttempt.status !== "scanned") {
    return {
      success: false,
      code: "SCAN_ALREADY_REVIEWED",
      message:
        "This scan attempt has already been reviewed",
    };
  }

  // --------------------------------------------------
  // 4. Update scan status
  //
  // Step 2 does NOT update team progress.
  // --------------------------------------------------

  const {
    data: updatedScan,
    error: updateError,
  } = await supabase
    .from("scan_attempts")
    .update({
      status: decision,
    })
    .eq(
      "scan-attempts_id",
      scanAttemptId
    )
    .eq("status", "scanned")
    .select(`
      "scan-attempts_id",
      team_id,
      step_no,
      scanned_qr_code,
      scanned_location_id,
      expected_location_id,
      is_correct,
      points,
      scanned_at,
      path_step_id,
      status,
      progress_applied
    `)
    .single();

  if (updateError) {
    console.error(
      "Update scan status error:",
      updateError
    );

    throw new Error(
      "Failed to update scan status"
    );
  }

  return {
    success: true,

    scan: {
      id: updatedScan["scan-attempts_id"],
      teamId: updatedScan.team_id,
      stepNo: updatedScan.step_no,
      scannedQrCode:
        updatedScan.scanned_qr_code,
      scannedLocationId:
        updatedScan.scanned_location_id,
      expectedLocationId:
        updatedScan.expected_location_id,
      isCorrect: updatedScan.is_correct,
      points: updatedScan.points,
      pathStepId:
        updatedScan.path_step_id,
      status: updatedScan.status,
      progressApplied:
        updatedScan.progress_applied,
      scannedAt: updatedScan.scanned_at,
    },

    message:
      decision === "accepted"
        ? "Scan accepted successfully"
        : "Scan rejected successfully",
  };
};


// ==================================================
// STEP 3 — Apply Team Progress
// ==================================================

export const applyScanProgress = async (
  scanAttemptId
) => {
  // --------------------------------------------------
  // 1. Call PostgreSQL transaction
  // --------------------------------------------------

  const {
    data,
    error,
  } = await supabase.rpc(
    "apply_scan_progress",
    {
      p_scan_id: scanAttemptId,
    }
  );

  // --------------------------------------------------
  // 2. Handle RPC errors
  // --------------------------------------------------

  if (error) {
    console.error(
      "Apply scan progress RPC error:",
      error
    );

    // PostgreSQL exceptions from our function
    // are returned through Supabase as errors.

    const errorMessage =
      error.message || "";

    if (
      errorMessage.includes(
        "SCAN_NOT_FOUND"
      )
    ) {
      return {
        success: false,
        code: "SCAN_NOT_FOUND",
        message: "Scan attempt not found",
      };
    }

    if (
      errorMessage.includes(
        "SCAN_NOT_ACCEPTED"
      )
    ) {
      return {
        success: false,
        code: "SCAN_NOT_ACCEPTED",
        message:
          "Only accepted scans can update team progress",
      };
    }

    if (
      errorMessage.includes(
        "PROGRESS_ALREADY_APPLIED"
      )
    ) {
      return {
        success: false,
        code: "PROGRESS_ALREADY_APPLIED",
        message:
          "Progress has already been applied for this scan",
      };
    }

    if (
      errorMessage.includes(
        "TEAM_NOT_FOUND"
      )
    ) {
      return {
        success: false,
        code: "TEAM_NOT_FOUND",
        message: "Team not found",
      };
    }

    throw new Error(
      "Failed to apply scan progress"
    );
  }

  // --------------------------------------------------
  // 3. Validate RPC response
  // --------------------------------------------------

  if (!data) {
    throw new Error(
      "No result returned from progress update"
    );
  }

  // --------------------------------------------------
  // 4. Return normalized response
  // --------------------------------------------------

  return {
    success: true,

    scan: {
      id: data.scan_id,
      teamId: data.team_id,
      isCorrect: data.is_correct,
      pointsChange: data.points_change,
      progressApplied:
        data.progress_applied,
    },

    team: {
      id: data.team_id,
      score: data.score,
      currentStep:
        data.current_step_no,
    },

    pointsChange:
      data.points_change,

    message: data.is_correct
      ? "Correct scan accepted. Team progressed to the next step."
      : "Wrong scan accepted. 50 points deducted. Team remains on the same step.",
  };
};