import API_URL from "./api";

// Throws Error(message) with the server's message, so the UI can show it as is.
const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
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

const post = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });

// items: [{ productId, quantity }]. Prices are never sent, the server computes them.
export const getProducts = async () => (await request("/payments/products")).products;

export const quoteOrder = async ({ items, couponCode }) =>
  (await post("/payments/quote", { items, couponCode: couponCode || null })).quote;

export const createPayment = async ({ items, couponCode, customerPhone, idempotencyKey }) =>
  (
    await post("/payments", {
      items,
      couponCode: couponCode || null,
      customerPhone,
      idempotencyKey,
    })
  ).payment;

export const getPayment = async (paymentId) =>
  (await request(`/payments/${encodeURIComponent(paymentId)}`)).payment;

export const getMyPayments = async () => (await request("/payments")).payments;
