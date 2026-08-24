import { useEffect, useState } from "react";
import "./teamRegistration.css";

const API_URL = import.meta.env.VITE_API_URL;

// Total team size, INCLUDING the leader
const MIN_TEAM_SIZE = 3;
const MAX_TEAM_SIZE = 4;

// Therefore, other members = 2 to 3
const MIN_MEMBERS = MIN_TEAM_SIZE - 1;
const MAX_MEMBERS = MAX_TEAM_SIZE - 1;

const createEmptyMember = () => ({
  name: "",
  email: "",
});

const TeamRegistration = () => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");

  // Start with minimum team size:
  // 1 leader + 2 members = 3 total
  const [members, setMembers] = useState([
    createEmptyMember(),
    createEmptyMember(),
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // --------------------------------------------------
  // Check IRIS authentication
  // --------------------------------------------------

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  // --------------------------------------------------
  // IRIS Login
  // --------------------------------------------------

  const handleIrisLogin = () => {
    window.location.href = `${API_URL}/auth/iris`;
  };

  // --------------------------------------------------
  // Member changes
  // --------------------------------------------------

  const handleMemberChange = (index, field, value) => {
    setMembers((currentMembers) =>
      currentMembers.map((member, currentIndex) =>
        currentIndex === index
          ? {
              ...member,
              [field]: value,
            }
          : member
      )
    );
  };

  // --------------------------------------------------
  // Add member
  // --------------------------------------------------

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) {
      return;
    }

    setMembers((currentMembers) => [
      ...currentMembers,
      createEmptyMember(),
    ]);
  };

  // --------------------------------------------------
  // Remove member
  // --------------------------------------------------

  const removeMember = (index) => {
    // Never allow fewer than 2 additional members
    // because total team size must be at least 3.
    if (members.length <= MIN_MEMBERS) {
      return;
    }

    setMembers((currentMembers) =>
      currentMembers.filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  };

  // --------------------------------------------------
  // Team registration
  // --------------------------------------------------

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    // Frontend validation
    if (members.length < MIN_MEMBERS) {
      setMessage(
        `A minimum of ${MIN_TEAM_SIZE} members including the leader is required.`
      );
      return;
    }

    if (members.length > MAX_MEMBERS) {
      setMessage(
        `A maximum of ${MAX_TEAM_SIZE} members including the leader is allowed.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/teams/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },

        // IMPORTANT:
        // Do NOT send leaderIrisId.
        // Backend gets it from req.user.irisId.
        body: JSON.stringify({
          teamName: teamName.trim(),

          password,

          members: members.map((member) => ({
            name: member.name.trim(),
            email: member.email.trim().toLowerCase(),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Team registration failed."
        );
        return;
      }

      setIsSuccess(true);
      setMessage(
        data.message || "Team registered successfully."
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

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (checkingAuth) {
    return (
      <div className="team-registration">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // Not logged in
  // --------------------------------------------------

  if (!user) {
    return (
      <div className="team-registration">
        <h2>Team Registration</h2>

        <p>
          Login with your NITK IRIS account to register
          your team.
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

  // --------------------------------------------------
  // Logged in
  // --------------------------------------------------

  return (
    <div className="team-registration">
      <h2>Team Registration</h2>

      {/* Leader information comes from IRIS */}
      <div className="leader-info">
        <p>
          <strong>Leader:</strong> {user.name}
        </p>

        <p>
          <strong>Roll No:</strong> {user.rollNo}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

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
              {members.length + 1}/{MAX_TEAM_SIZE}
            </span>
          </div>

          <p>
            Add {MIN_MEMBERS}–{MAX_MEMBERS} other members.
            The leader is already included.
          </p>

          {members.map((member, index) => (
            <div
              className="team-member"
              key={index}
            >
              <div className="form-group">
                <label htmlFor={`member-name-${index}`}>
                  Member {index + 1} Name
                </label>

                <input
                  id={`member-name-${index}`}
                  type="text"
                  value={member.name}
                  onChange={(event) =>
                    handleMemberChange(
                      index,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter member name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`member-email-${index}`}>
                  Member {index + 1} NITK Email
                </label>

                <input
                  id={`member-email-${index}`}
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

              {members.length > MIN_MEMBERS && (
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

          {members.length < MAX_MEMBERS && (
            <button
              type="button"
              onClick={addMember}
            >
              + Add Member
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
            isSuccess
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