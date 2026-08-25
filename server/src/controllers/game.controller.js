import { getTeamGameState, processScan } from "../services/game.service.js";
import { supabase } from "../config/supabase.js";

export const getGameState = async (req, res) => {
  try {
    const teamId = req.team.id;
    
    // Fetch team name from the existing teams table
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("team_name")
      .eq("id", teamId)
      .maybeSingle();
      
    if (teamError) {
      console.error("Error fetching team name for game state:", teamError);
    }
    
    const teamName = teamData ? teamData.team_name : "Squad";
    
    const gameState = getTeamGameState(teamId, teamName);
    return res.json(gameState);
  } catch (error) {
    console.error("Get game state error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve game state."
    });
  }
};

export const scanQrCode = async (req, res) => {
  try {
    const teamId = req.team.id;
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: "QR Code is required."
      });
    }

    // Fetch team name
    const { data: teamData } = await supabase
      .from("teams")
      .select("team_name")
      .eq("id", teamId)
      .maybeSingle();
    
    const teamName = teamData ? teamData.team_name : "Squad";
    
    const result = processScan(teamId, teamName, qrCode);
    return res.json(result);
  } catch (error) {
    console.error("Scan QR error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process scan."
    });
  }
};
