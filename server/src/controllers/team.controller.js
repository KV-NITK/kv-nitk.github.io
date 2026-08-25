import { registerTeamSchema } from "../validators/team.validator.js";

import {
  validateMemberDetails,
  checkTeamNameExists,
  checkExistingMembers,
  checkLeaderExists,
  checkLeaderRollNoExists,
  createTeam,
  getUserTeam,
  deleteTeamByLeader,
  getAllTeamsPublic,
} from "../services/team.service.js";

export const getAllRegisteredTeamsPublic = async (req, res) => {
  try {
    const providedPass =
      req.query.pass ||
      req.headers["x-passcode"] ||
      req.headers["authorization"] ||
      "";

    const cleanPass = String(providedPass).trim().toLowerCase();

    if (cleanPass !== "raama-raama") {
      return res.status(401).json({
        success: false,
        message: "Invalid passcode. Please enter the correct event passcode to view registered teams.",
      });
    }

    const teams = await getAllTeamsPublic();
    return res.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Fetch public teams error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registered teams list",
    });
  }
};

export const getMyTeam = async (req, res) => {
  try {
    const team = await getUserTeam(req.user);

    return res.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Get my team error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user team",
    });
  }
};

export const deleteMyTeam = async (req, res) => {
  try {
    const result = await deleteTeamByLeader(req.user);

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.message,
      });
    }

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete team error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete team",
    });
  }
};

import { hashPassword } from "../utils/password.js";

export const registerTeam = async (req, res) => {
  try {
    // 1. Validate request
    const result = registerTeamSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const data = result.data;

    // Leader information comes from IRIS session
    const leaderIrisId = req.user.irisId;
    const leaderRollNo = req.user.rollNo;

    // 2. Validate member emails + roll numbers
    const memberValidation = validateMemberDetails(
      data.members,
      leaderRollNo
    );

    if (!memberValidation.valid) {
      return res.status(400).json({
        success: false,
        message: memberValidation.message,
      });
    }

    // 3. Check if leader is already registered as a leader
    const leaderExists = await checkLeaderExists(leaderIrisId);

    if (leaderExists) {
      return res.status(409).json({
        success: false,
        message: "You have already registered a team as leader",
      });
    }

    // 4. Check if leader's roll number is already registered
    const leaderRollExists =
      await checkLeaderRollNoExists(leaderRollNo);

    if (leaderRollExists) {
      return res.status(409).json({
        success: false,
        message:
          "Your roll number is already registered with a team",
      });
    }

    // 5. Check team name
    const teamExists = await checkTeamNameExists(
      data.teamName
    );

    if (teamExists) {
      return res.status(409).json({
        success: false,
        message: "Team name already exists. Use some other name",
      });
    }

    // 6. Check existing member emails + roll numbers
    const existingMembers =
      await checkExistingMembers(data.members);

    if (
      existingMembers.emails.length > 0 ||
      existingMembers.rollNumbers.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message: "One or more members are already registered",
        emails: existingMembers.emails,
        rollNumbers: existingMembers.rollNumbers,
      });
    }

    // 7. Hash password
    const passwordHash = await hashPassword(data.password);

    // 8. Create team + members atomically
    const teamId = await createTeam({
      teamName: data.teamName,
      passwordHash,
      leaderIrisId,
      leaderRollNo,
      leaderName: req.user.name,
      leaderEmail: req.user.email,
      members: data.members,
    });

    return res.status(201).json({
      success: true,
      message: "Team registered successfully",
      teamId,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register team",
    });
  }
};