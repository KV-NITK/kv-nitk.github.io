import {
  saveEventFeedback,
  getUserFeedback,
  getTeamFeedback,
  getAllFeedback,
} from "../services/feedback.service.js";

/**
 * Get current user's submitted feedback
 */
export const getMyFeedback = async (req, res) => {
  try {
    const feedback = await getUserFeedback(req.user);
    return res.json({
      success: true,
      hasSubmitted: Boolean(feedback),
      feedback: feedback || null,
    });
  } catch (error) {
    console.error("Get my feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your feedback.",
    });
  }
};

/**
 * Submit or update feedback for current user
 */
export const submitFeedback = async (req, res) => {
  try {
    const {
      teamName,
      teamId,
      role,
      eventRating,
      clueDifficulty,
      favoriteMoment,
      suggestions,
    } = req.body;

    if (!teamName || !eventRating || !clueDifficulty || !favoriteMoment || !suggestions) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    const feedback = await saveEventFeedback({
      teamId,
      teamName,
      userIrisId: req.user?.irisId,
      userName: req.user?.name,
      userEmail: req.user?.email,
      userRollNo: req.user?.rollNo,
      userRole: role || "member",
      eventRating,
      clueDifficulty,
      favoriteMoment,
      suggestions,
    });

    return res.json({
      success: true,
      message: "Your feedback has been successfully recorded!",
      feedback,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback. Please try again.",
    });
  }
};

/**
 * Get all feedback submitted by members of a team
 */
export const getTeamFeedbackList = async (req, res) => {
  try {
    const { teamId } = req.params;
    const feedbackList = await getTeamFeedback(teamId);
    return res.json({
      success: true,
      data: feedbackList,
    });
  } catch (error) {
    console.error("Get team feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve squad feedback.",
    });
  }
};

/**
 * Get all feedback submissions across all teams
 */
export const getFeedbackList = async (req, res) => {
  try {
    const feedbackList = await getAllFeedback();
    return res.json({
      success: true,
      data: feedbackList,
    });
  } catch (error) {
    console.error("Get feedback list error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback list.",
    });
  }
};
