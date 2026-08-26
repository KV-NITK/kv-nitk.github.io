export const requireCoordinatorAuth = (req, res, next) => {
  try {
    const providedPasscode =
      req.headers["x-coordinator-passcode"];

    const coordinatorPasscode =
      process.env.COORDINATOR_PASSCODE;

    if (!coordinatorPasscode) {
      console.error(
        "COORDINATOR_PASSCODE is not configured"
      );

      return res.status(500).json({
        success: false,
        message: "Coordinator authentication is not configured",
      });
    }

    if (
      !providedPasscode ||
      providedPasscode !== coordinatorPasscode
    ) {
      return res.status(401).json({
        success: false,
        message: "Coordinator authentication required",
      });
    }

    req.isCoordinator = true;

    next();
  } catch (error) {
    console.error("Coordinator auth error:", error);

    return res.status(500).json({
      success: false,
      message: "Coordinator authentication failed",
    });
  }
};