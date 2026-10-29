import API_URL from "./api";

// The staff admin password is checked by the server on every call; a wrong one
// comes back as an Error with status 401 (429 after too many tries).
const staffRequest = async (passcode, path = "", options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}/admin/staff${path}`, {
      ...options,
      headers: {
        "x-staff-admin-passcode": passcode,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new Error("Network error. Please check your connection.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    throw error;
  }

  return data;
};

// { staff, statsAvailable }
export const listStaff = (passcode) => staffRequest(passcode);

export const addStaff = async (passcode, { irisId, name, role, active }) =>
  (await staffRequest(passcode, "", { method: "POST", body: JSON.stringify({ irisId, name, role, active }) })).staff;

// changes: any of { name, role, active }
export const updateStaff = async (passcode, irisId, changes) =>
  (await staffRequest(passcode, `/${irisId}`, { method: "PATCH", body: JSON.stringify(changes) })).staff;
