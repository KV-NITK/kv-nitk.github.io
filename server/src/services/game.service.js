const LOCATIONS = [
  {
    id: "loc-1",
    name: "LHC (Lecture Hall Complex)",
    x_coord: 900,
    y_coord: 350,
    reveal_radius: 120,
    clue: "Find the place where the future engineers listen to daily lectures, near the green lawn.",
    qrCode: "qr-lhc"
  },
  {
    id: "loc-2",
    name: "Main Pavilion",
    x_coord: 1100,
    y_coord: 450,
    reveal_radius: 100,
    clue: "Where sports stars rest and crowds cheer, overlooking the running tracks.",
    qrCode: "qr-pavilion"
  },
  {
    id: "loc-3",
    name: "Srinivas Library",
    x_coord: 850,
    y_coord: 550,
    reveal_radius: 110,
    clue: "A treasury of knowledge, silences must be kept, books of past giants are piled high.",
    qrCode: "qr-library"
  },
  {
    id: "loc-4",
    name: "Mega Hostel Complex",
    x_coord: 1300,
    y_coord: 250,
    reveal_radius: 130,
    clue: "The towering blocks where nights are sleepless and friendships are forged over instant noodles.",
    qrCode: "qr-mega"
  },
  {
    id: "loc-5",
    name: "ATB (Applied Mechanics Block)",
    x_coord: 950,
    y_coord: 650,
    reveal_radius: 100,
    clue: "Where forces are analyzed and fluid dynamics are simulated, next to the heritage gate.",
    qrCode: "qr-atb"
  },
  {
    id: "loc-6",
    name: "Main Lawn",
    x_coord: 1050,
    y_coord: 550,
    reveal_radius: 110,
    clue: "The green heart of East Campus where students gather to bask in the sun and click pictures.",
    qrCode: "qr-lawn"
  },
  // Dummy locations
  {
    id: "dummy-1",
    name: "Mechanical Dept Seminar Hall",
    x_coord: 820,
    y_coord: 250,
    reveal_radius: 90,
    clue: "",
    qrCode: "qr-mech"
  },
  {
    id: "dummy-2",
    name: "Chemical Dept Block",
    x_coord: 1200,
    y_coord: 600,
    reveal_radius: 100,
    clue: "",
    qrCode: "qr-chem"
  },
  {
    id: "dummy-3",
    name: "NTB (New Technology Block)",
    x_coord: 1000,
    y_coord: 200,
    reveal_radius: 100,
    clue: "",
    qrCode: "qr-ntb"
  },
  {
    id: "dummy-4",
    name: "Silver Jubilee Auditorium",
    x_coord: 1250,
    y_coord: 400,
    reveal_radius: 120,
    clue: "",
    qrCode: "qr-sja"
  }
];

const PATH_STEPS = ["loc-1", "loc-2", "loc-3", "loc-4", "loc-5", "loc-6"];

// In-memory store: teamId -> teamGameState
const gameSessions = new Map();

// Helper: Get or initialize team game state
export const getTeamGameState = (teamId, teamName) => {
  if (!gameSessions.has(teamId)) {
    gameSessions.set(teamId, {
      teamId,
      teamName,
      score: 100, // starting score
      currentStepNo: 1, // 1 to 6
      revealedLocations: ["loc-1"], // Start with location 1 revealed
      incorrectAttempts: [], // array of { x, y, name, timestamp }
      completed: false
    });
  }

  const state = gameSessions.get(teamId);
  return formatGameStateResponse(state);
};

// Helper to structure response for the frontend
const formatGameStateResponse = (state) => {
  // Find current clue (points to the NEXT location in path)
  // If currentStepNo is 1, next location index is 1 (PATH_STEPS[1] which is loc-2)
  let currentClueText = "Congratulations! You have completed the treasure hunt!";
  let nextExpectedLocId = null;

  if (state.currentStepNo < PATH_STEPS.length) {
    nextExpectedLocId = PATH_STEPS[state.currentStepNo];
    const nextLoc = LOCATIONS.find(l => l.id === nextExpectedLocId);
    currentClueText = nextLoc ? nextLoc.clue : "";
  }

  // Get full location coordinates for revealed locations
  const revealedDetails = state.revealedLocations.map(id => {
    const loc = LOCATIONS.find(l => l.id === id);
    return {
      id: loc.id,
      name: loc.name,
      x_coord: loc.x_coord,
      y_coord: loc.y_coord,
      reveal_radius: loc.reveal_radius
    };
  });

  return {
    success: true,
    score: state.score,
    currentStepNo: state.currentStepNo,
    totalSteps: PATH_STEPS.length,
    currentClueText,
    revealedLocations: revealedDetails,
    incorrectAttempts: state.incorrectAttempts,
    completed: state.completed,
    locationsList: LOCATIONS.map(l => ({ id: l.id, name: l.name, qrCode: l.qrCode })) // exported for dev panel simulation
  };
};

// Process scanned QR code
export const processScan = (teamId, teamName, qrCode) => {
  // Ensure state is initialized
  if (!gameSessions.has(teamId)) {
    getTeamGameState(teamId, teamName);
  }

  const state = gameSessions.get(teamId);

  if (state.completed) {
    return {
      success: false,
      message: "You have already completed the hunt!",
      gameState: formatGameStateResponse(state)
    };
  }

  // Determine what QR code we are expecting
  // E.g. at step 1, we expect PATH_STEPS[1] (loc-2) QR code
  const nextLocIndex = state.currentStepNo;
  if (nextLocIndex >= PATH_STEPS.length) {
    return {
      success: false,
      message: "Invalid game state. Already at final step.",
      gameState: formatGameStateResponse(state)
    };
  }

  const expectedLocId = PATH_STEPS[nextLocIndex];
  const expectedLoc = LOCATIONS.find(l => l.id === expectedLocId);

  const cleanQr = String(qrCode).trim();

  // 1. Correct Scan
  if (expectedLoc && cleanQr === expectedLoc.qrCode) {
    state.currentStepNo += 1;
    if (!state.revealedLocations.includes(expectedLocId)) {
      state.revealedLocations.push(expectedLocId);
    }
    state.score += 20; // Correct scan reward

    if (state.currentStepNo === PATH_STEPS.length) {
      state.completed = true;
    }

    return {
      success: true,
      message: `Excellent! You successfully found: ${expectedLoc.name}!`,
      gameState: formatGameStateResponse(state)
    };
  }

  // 2. Incorrect Scan: Check if it matches any other location in the game
  const scannedLoc = LOCATIONS.find(l => cleanQr === l.qrCode);
  if (scannedLoc) {
    // Deduct points
    state.score = Math.max(0, state.score - 10);
    
    // Add to incorrect attempts list
    state.incorrectAttempts.push({
      x: scannedLoc.x_coord,
      y: scannedLoc.y_coord,
      name: scannedLoc.name,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      message: `Incorrect location scanned: "${scannedLoc.name}". Penalty applied!`,
      gameState: formatGameStateResponse(state)
    };
  }

  // 3. Completely invalid QR scan
  state.score = Math.max(0, state.score - 5);
  return {
    success: false,
    message: "Invalid QR code. This code is not part of the hunt. Penalty applied!",
    gameState: formatGameStateResponse(state)
  };
};
