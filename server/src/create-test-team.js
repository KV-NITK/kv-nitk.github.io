import { supabase } from "./config/supabase.js";
import { hashPassword } from "./utils/password.js";

async function main() {
  const teamName = "testteam";
  const password = "testpassword";
  const hash = await hashPassword(password);
  
  // Clean up any existing test team first to prevent unique constraint conflicts
  await supabase
    .from("teams")
    .delete()
    .eq("team_name", teamName);

  const { data, error } = await supabase
    .from("teams")
    .insert({
      team_name: teamName,
      password_hash: hash,
      leader_iris_id: "mock-iris-id-1234",
      leader_roll_no: "MOCK1234",
      status: "active",
      score: 1000,
      current_step_no: 1
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating test team:", error);
  } else {
    console.log("\n==========================================");
    console.log("Test team created successfully!");
    console.log("Team ID:       ", data.id);
    console.log("Team Name:     ", teamName);
    console.log("Password:      ", password);
    console.log("==========================================\n");
  }
}

main();
