// Everything that points back at the frontend is built from FRONTEND_URL, so the
// dev port (or the production domain) is set in one place.

const trimSlash = (url) => url.replace(/\/+$/, "");

export const getFrontendUrl = () => trimSlash(process.env.FRONTEND_URL || "");

// Where Cashfree sends the user after paying. {order_id} is filled in by Cashfree.
// CASHFREE_RETURN_URL only needs setting to override the default.
export const getPaymentReturnUrl = () =>
  process.env.CASHFREE_RETURN_URL ||
  `${getFrontendUrl()}/payment/status?order_id={order_id}`;

// Origins the browser may call the API from. In development the site can be opened
// on localhost or the dev.local host, always on the port FRONTEND_URL says.
export const getAllowedOrigins = () => {
  const frontendUrl = getFrontendUrl();
  const origins = [frontendUrl];

  try {
    const { port } = new URL(frontendUrl);
    const suffix = port ? `:${port}` : "";

    origins.push(
      `http://localhost${suffix}`,
      `http://kannadavedike.dev.local${suffix}`,
      `https://kannadavedike.dev.local${suffix}`
    );
  } catch {
    // FRONTEND_URL missing or not a URL: only what is set is allowed
  }

  return [...new Set(origins.filter(Boolean))];
};
