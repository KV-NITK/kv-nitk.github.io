import { supabase } from "../config/supabase.js";

/*
 * Step 1:
 * Verify a scanned QR against the team's
 * currently expected location.
 *
 * IMPORTANT:
 * - Does NOT update team.score
 * - Does NOT update team.current_step_no
 * - Does NOT assign a path
 *
 * It only verifies and records the scan attempt.
 */

export const verifyScan = async (teamId, scannedQrCode) => {
  const cleanQrCode = String(scannedQrCode || "").trim();

  if (!cleanQrCode) {
    throw new Error("QR code is required");
  }

  // --------------------------------------------------
  // 1. Get the team's current path and step
  // --------------------------------------------------

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, path_id, current_step_no, score, status")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError) {
    console.error("Fetch team error:", teamError);
    throw new Error("Failed to fetch team");
  }

  if (!team) {
    throw new Error("Team not found");
  }

  // Path will be assigned later.
  if (!team.path_id) {
    return {
      success: false,
      code: "PATH_NOT_ASSIGNED",
      message: "A path has not been assigned to this team yet",
    };
  }

  if (
    team.current_step_no === null ||
    team.current_step_no === undefined
  ) {
    throw new Error("Team current step is not configured");
  }

  // --------------------------------------------------
  // 2. Find the team's current path step
  // --------------------------------------------------

  const { data: pathStep, error: pathStepError } = await supabase
    .from("path_steps")
    .select("path_step_id, path_id, step_no, clue_id")
    .eq("path_id", team.path_id)
    .eq("step_no", team.current_step_no)
    .maybeSingle();

  if (pathStepError) {
    console.error("Fetch path step error:", pathStepError);
    throw new Error("Failed to fetch current path step");
  }

  if (!pathStep) {
    throw new Error("Current path step not found");
  }

  // --------------------------------------------------
  // 3. Get the clue attached to this path step
  // --------------------------------------------------

  const { data: clue, error: clueError } = await supabase
    .from("clues")
    .select("clue_id, clue_image_url, location_id, variant")
    .eq("clue_id", pathStep.clue_id)
    .maybeSingle();

  if (clueError) {
    console.error("Fetch clue error:", clueError);
    throw new Error("Failed to fetch current clue");
  }

  if (!clue) {
    throw new Error("Current clue not found");
  }

  // --------------------------------------------------
  // 4. Get the expected location
  // --------------------------------------------------

  const { data: expectedLocation, error: locationError } =
    await supabase
      .from("locations")
      .select("location_id, name, qr_code")
      .eq("location_id", clue.location_id)
      .maybeSingle();

  if (locationError) {
    console.error(
      "Fetch expected location error:",
      locationError
    );

    throw new Error("Failed to fetch expected location");
  }

  if (!expectedLocation) {
    throw new Error("Expected location not found");
  }

  // --------------------------------------------------
  // 5. Compare scanned QR with expected QR
  // --------------------------------------------------

  const isCorrect =
    cleanQrCode ===
    String(expectedLocation.qr_code).trim();

  // --------------------------------------------------
  // 6. If scanned QR belongs to another known location,
  //    identify it for the scan attempt.
  // --------------------------------------------------

  let scannedLocation = null;

  const {
    data: scannedLocationData,
    error: scannedLocationError,
  } = await supabase
    .from("locations")
    .select("location_id, name, qr_code")
    .eq("qr_code", cleanQrCode)
    .maybeSingle();

  if (scannedLocationError) {
    console.error(
      "Identify scanned location error:",
      scannedLocationError
    );

    throw new Error("Failed to identify scanned location");
  }

  scannedLocation = scannedLocationData;

  // --------------------------------------------------
  // 7. Store scan attempt
  //
  // DO NOT update team score/current_step_no here.
  // Coordinator confirmation will handle that later.
  // --------------------------------------------------

  const {
    data: scanAttempt,
    error: scanError,
  } = await supabase
    .from("scan_attempts")
    .insert({
      team_id: team.id,
      step_no: team.current_step_no,
      scanned_qr_code: cleanQrCode,
      scanned_location_id: scannedLocation
        ? scannedLocation.location_id
        : null,
      expected_location_id:
        expectedLocation.location_id,
      is_correct: isCorrect,
      points: 1000,
      path_step_id: pathStep.path_step_id,
    })
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
      path_step_id
    `)
    .single();

  if (scanError) {
    console.error(
      "Create scan attempt error:",
      scanError
    );

    throw new Error("Failed to store scan attempt");
  }

  // --------------------------------------------------
  // 8. Return verification result
  // --------------------------------------------------

  return {
    success: true,

    scan: {
      id: scanAttempt["scan-attempts_id"],

      isCorrect,

      stepNo: team.current_step_no,

      scannedLocation: scannedLocation
        ? {
            id: scannedLocation.location_id,
            name: scannedLocation.name,
          }
        : null,

      expectedLocation: {
        id: expectedLocation.location_id,
        name: expectedLocation.name,
      },

      clue: {
        id: clue.clue_id,
        imageUrl: clue.clue_image_url || null,
        variant: clue.variant,
      },

      points: scanAttempt.points,

      // Current state is returned only.
      // It is NOT modified.
      currentScore: team.score,
      currentStep: team.current_step_no,
    },

    message: isCorrect
      ? "Correct QR code"
      : "Wrong QR code",
  };
};

/*
 * Step 2:
 * Coordinator explicitly approves and advances the team step.
 * Updates team.current_step_no and team.score.
 */
export const advanceTeamStep = async (teamId, scanAttemptId) => {
  if (!teamId) {
    throw new Error("Team ID is required");
  }

  // 1. Fetch team's current state
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, current_step_no, score, status")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    throw new Error("Team not found");
  }

  const currentStep = Math.max(1, team.current_step_no || 1);
  const newStep = currentStep + 1;
  const newScore = (team.score || 0) + 1000;

  // 2. Update team progression
  const { data: updatedTeam, error: updateError } = await supabase
    .from("teams")
    .update({
      current_step_no: newStep,
      score: newScore,
      updated_at: new Date().toISOString()
    })
    .eq("id", teamId)
    .select("id, current_step_no, score")
    .single();

  if (updateError) {
    console.error("Advance team step error:", updateError);
    throw new Error("Failed to advance team step");
  }

  // 3. Mark scan attempt as approved if scanAttemptId provided
  if (scanAttemptId) {
    await supabase
      .from("scan_attempts")
      .update({ status: "approved" })
      .eq("scan-attempts_id", scanAttemptId);
  }

  return {
    success: true,
    team: {
      id: updatedTeam.id,
      currentStep: updatedTeam.current_step_no,
      score: updatedTeam.score
    },
    message: `Team successfully advanced to Step ${updatedTeam.current_step_no}!`
  };
};