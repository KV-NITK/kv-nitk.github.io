import { useEffect, useState } from "react";
import "./teamRegistration.css";

const API_URL = import.meta.env.VITE_API_URL;

const TeamRegistration = ({
  minPlayers = 3,
  maxPlayers = 4,
}) => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");

  const [members, setMembers] = useState([
    {
      name: "",
      email: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Check whether the leader is logged in with IRIS
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect leader to IRIS login
  const handleIrisLogin = () => {
    window.location.href = `${API_URL}/auth/iris`;
  };

  // Update player details
  const handleMemberChange = (index, field, value) => {
    setMembers((current) =>
      current.map((member, i) =>
        i === index
          ? {
              ...member,
              [field]: value,
            }
          : member
      )
    );
  };

  // Add player
  const addMember = () => {
    if (members.length >= maxPlayers) {
      return;
    }

    setMembers((current) => [
      ...current,
      {
        name: "",
        email: "",
      },
    ]);
  };

  // Remove player
  const removeMember = (index) => {
    if (members.length <= minPlayers) {
      return;
    }

    setMembers((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  // Register team
  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (members.length < minPlayers) {
      setMessage(
        `At least ${minPlayers} players are required.`
      );
      return;
    }

    if (members.length > maxPlayers) {
      setMessage(
        `Maximum ${maxPlayers} players are allowed.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/teams/register`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamName: teamName.trim(),
            password,
            members: members.map((member) => ({
              name: member.name.trim(),
              email: member.email.trim().toLowerCase(),
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Team registration failed"
        );
        return;
      }

      setSuccess(true);
      setMessage(
        data.message || "Team registered successfully"
      );
    } catch (error) {
      console.error("Team registration error:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading authentication state
  if (checkingAuth) {
    return (
      <div className="team-registration">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Leader is not authenticated
  if (!user) {
    return (
      <div className="team-registration">
        <h2>Team Registration</h2>

        <p>
          Login with your IRIS account to register a team.
        </p>

        <button
          type="button"
          onClick={handleIrisLogin}
        >
          Login with IRIS
        </button>
      </div>
    );
  }

  // Leader is authenticated
  return (
    <div className="team-registration">
      <h2>Team Registration</h2>

      <p>
        Logged in as{" "}
        <strong>{user.name}</strong>
      </p>

      <form onSubmit={handleRegister}>
        {/* Team name */}
        <div className="form-group">
          <label htmlFor="team-name">
            Team Name
          </label>

          <input
            id="team-name"
            type="text"
            value={teamName}
            onChange={(event) =>
              setTeamName(event.target.value)
            }
            placeholder="Enter team name"
            required
          />
        </div>

        {/* Team password */}
        <div className="form-group">
          <label htmlFor="team-password">
            Team Password
          </label>

          <input
            id="team-password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Create team password"
            required
          />
        </div>

        {/* Members */}
        <div className="members-section">
          <div className="members-header">
            <h3>Team Members</h3>

            <span>
              {members.length}/{maxPlayers}
            </span>
          </div>

          {members.map((member, index) => (
            <div
              className="team-member"
              key={index}
            >
              <div className="form-group">
                <label>
                  Player {index + 1} Name
                </label>

                <input
                  type="text"
                  value={member.name}
                  onChange={(event) =>
                    handleMemberChange(
                      index,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter player name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Player {index + 1} NITK Email
                </label>

                <input
                  type="email"
                  value={member.email}
                  onChange={(event) =>
                    handleMemberChange(
                      index,
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="Enter NITK email"
                  required
                />
              </div>

              {members.length > minPlayers && (
                <button
                  type="button"
                  onClick={() =>
                    removeMember(index)
                  }
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {members.length < maxPlayers && (
            <button
              type="button"
              onClick={addMember}
            >
              + Add Player
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Registering..."
            : "Register Team"}
        </button>
      </form>

      {message && (
        <p
          className={
            success
              ? "registration-message success"
              : "registration-message error"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default TeamRegistration;