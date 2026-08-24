import { registerTeamSchema } from "../validators/team.validator.js";

import {
  validateMemberEmails,
  checkTeamNameExists,
  checkMemberEmailsExist,
  createTeam,
} from "../services/team.service.js";

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

    // 2. Check duplicate emails inside request
    const emailCheck = validateMemberEmails(data.members);

    if (!emailCheck.valid) {
      return res.status(400).json({
        success: false,
        message: emailCheck.message,
      });
    }

    // 3. Check team name
    const teamExists = await checkTeamNameExists(data.teamName);

    if (teamExists) {
      return res.status(409).json({
        success: false,
        message: "Team name is already registered",
      });
    }

    // 4. Check existing member emails
    const existingMembers =
      await checkMemberEmailsExist(data.members);

    if (existingMembers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "One or more members are already registered",
        emails: existingMembers.map(
          (member) => member.email
        ),
      });
    }

    // 5. Hash password
    const passwordHash = await hashPassword(data.password);

  
    const leaderIrisId = req.user.irisId;

    // 6. Create team + members atomically
    const teamId = await createTeam({
      teamName: data.teamName,
      passwordHash,
      leaderIrisId,
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