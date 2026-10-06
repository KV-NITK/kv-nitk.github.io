import API_URL from "./api";

// Every order. The password is checked by the server on each call; a wrong one
// comes back as an Error with status 401 (429 after too many tries).
export const getAllOrders = async (passcode) => {
  let response;

  try {
    response = await fetch(`${API_URL}/admin/orders`, {
      headers: { "x-admin-passcode": passcode },
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

  return data.orders;
};
