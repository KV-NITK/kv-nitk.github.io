import API_URL from "./api";

// The staff admin password is checked by the server on every call; a wrong one
// comes back as an Error with status 401 (429 after too many tries).
const adminRequest = async (passcode, path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}/admin${path}`, {
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

const staffRequest = (passcode, path = "", options = {}) => adminRequest(passcode, `/staff${path}`, options);

// { staff, statsAvailable }
export const listStaff = (passcode) => staffRequest(passcode);

export const addStaff = async (passcode, { irisId, name, role, active }) =>
  (await staffRequest(passcode, "", { method: "POST", body: JSON.stringify({ irisId, name, role, active }) })).staff;

// changes: any of { name, role, active }
export const updateStaff = async (passcode, irisId, changes) =>
  (await staffRequest(passcode, `/${irisId}`, { method: "PATCH", body: JSON.stringify(changes) })).staff;

// One staff member's claims and reverts: { activity, total, page, pageSize }
export const getStaffActivity = (passcode, irisId, { category, action, q, page = 1 } = {}) => {
  const query = new URLSearchParams({ page: String(page) });
  if (category) query.set("category", category);
  if (action) query.set("action", action);
  if (q) query.set("q", q);
  return staffRequest(passcode, `/${irisId}/activity?${query}`);
};

// reason is optional
export const revertClaim = async (passcode, passId, reason) =>
  (await adminRequest(passcode, `/passes/${passId}/revert`, { method: "POST", body: JSON.stringify(reason ? { reason } : {}) })).item;

// kind: NOTE or MISHANDLED
export const addPassNote = async (passcode, passId, { note, kind }) =>
  (await adminRequest(passcode, `/passes/${passId}/notes`, { method: "POST", body: JSON.stringify({ note, kind }) })).note;

// Merch stock and on-spot sales. Every call returns { rows, unmatched, spotSales }.
export const getInventory = (passcode) => adminRequest(passcode, "/inventory");

// items: [{ productId, stock }]
export const saveStock = (passcode, items) =>
  adminRequest(passcode, "/inventory", { method: "PUT", body: JSON.stringify({ items }) });

export const addSpotSale = (passcode, { productId, quantity, studentName }) =>
  adminRequest(passcode, "/inventory/spot-sales", { method: "POST", body: JSON.stringify({ productId, quantity, studentName }) });

export const undoSpotSale = (passcode, id) =>
  adminRequest(passcode, `/inventory/spot-sales/${id}/undo`, { method: "POST" });
