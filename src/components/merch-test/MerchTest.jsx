import { Link, useSearchParams } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import API_URL from "../../api/api";
import { itemLabel, rupees } from "./orderFormat";
import { CASHFREE_MODE, createPayment, getProducts, newIdempotencyKey, quoteOrder } from "../../api/payments";

export const EARLY_BIRD_COUPONS = ["POORVAPAKSHI", "NAMMANITK", "SAMUDRAPPA69"];

// Group variant rows (one per size) into one card per t-shirt.
const groupProducts = (products) => {
  const groups = new Map();

  for (const p of products) {
    if (!groups.has(p.groupKey)) {
      groups.set(p.groupKey, {
        key: p.groupKey,
        name: p.name,
        unitPrice: p.unitPrice,
        maxQuantity: p.maxQuantity,
        variants: [],
      });
    }
    groups.get(p.groupKey).variants.push({ id: p.id, size: p.variant });
  }

  return [...groups.values()];
};

const MerchTest = () => {
  const [searchParams] = useSearchParams();
  const loginFailed = searchParams.has("login_error");
  const [user, setUser] = useState(undefined); // undefined = checking, null = logged out
  const [groups, setGroups] = useState([]);
  const [loadError, setLoadError] = useState("");

  // sizes[groupKey] = ["M", "L"]  -> one entry per unit, "" = size not chosen yet
  const [sizes, setSizes] = useState({});
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const isEarlyBird = EARLY_BIRD_COUPONS.includes(appliedCoupon.trim().toUpperCase());

  // One idempotency key per distinct checkout, reused if the user clicks Pay again
  const keyRef = useRef({ signature: "", key: "" });

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.success && d.user ? d.user : null))
      .catch(() => setUser(null));

    getProducts()
      .then((products) => setGroups(groupProducts(products)))
      .catch((e) => setLoadError(e.message));
  }, []);

  // Cart lines for the API: units grouped by size -> one line per variant
  const { cartItems, missingSize } = useMemo(() => {
    const lines = new Map();
    let missing = false;

    for (const group of groups) {
      for (const size of sizes[group.key] || []) {
        const variant = group.variants.find((v) => v.size === size);

        if (!variant) {
          missing = true;
          continue;
        }

        lines.set(variant.id, (lines.get(variant.id) || 0) + 1);
      }
    }

    return {
      cartItems: [...lines].map(([productId, quantity]) => ({ productId, quantity })),
      missingSize: missing,
    };
  }, [groups, sizes]);

  // Price shown to the user always comes from the server
  useEffect(() => {
    setQuoteError("");

    if (!user || missingSize || cartItems.length === 0) {
      setQuote(null);
      return;
    }

    let cancelled = false;

    quoteOrder({ items: cartItems, couponCode: appliedCoupon })
      .then((q) => !cancelled && setQuote(q))
      .catch((e) => {
        if (cancelled) return;
        setQuote(null);
        setQuoteError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [user, cartItems, missingSize, appliedCoupon]);

  const unitCount = (group) => (sizes[group.key] || []).length;

  const setQuantity = (group, next) => {
    const qty = Math.max(0, Math.min(group.maxQuantity, next));

    setSizes((prev) => {
      const current = prev[group.key] || [];
      const updated = current.slice(0, qty);
      while (updated.length < qty) updated.push("");
      return { ...prev, [group.key]: updated };
    });
  };

  const setUnitSize = (group, index, size) => {
    setSizes((prev) => {
      const updated = [...(prev[group.key] || [])];
      updated[index] = size;
      return { ...prev, [group.key]: updated };
    });
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/iris?redirect=/merch-test`;
  };

  const phoneValid = /^[6-9]\d{9}$/.test(phone.trim());
  const canPay = !!quote && phoneValid && !paying && !missingSize && !quoteError;

  const handlePay = async () => {
    setPayError("");
    setPaying(true);

    try {
      const signature = JSON.stringify([cartItems, appliedCoupon, phone.trim()]);

      if (keyRef.current.signature !== signature) {
        keyRef.current = { signature, key: newIdempotencyKey() };
      }

      const payment = await createPayment({
        items: cartItems,
        couponCode: appliedCoupon,
        customerPhone: phone.trim(),
        idempotencyKey: keyRef.current.key,
      });

      // Same checkout key came back for an order that is already paid
      if (payment.status === "SUCCESS") {
        window.location.href = `/payment/status?order_id=${encodeURIComponent(payment.orderId)}`;
        return;
      }

      const cashfree = await load({ mode: CASHFREE_MODE });

      // Redirects to Cashfree, then back to CASHFREE_RETURN_URL (/payment/status)
      await cashfree.checkout({
        paymentSessionId: payment.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (e) {
      if (e.status) {
        keyRef.current = { signature: "", key: "" };
      }

      setPayError(e.message || "Could not start payment");
      setPaying(false);
    }
  };

  if (user === undefined) {
    return <Shell><p className="text-neutral-500">Loading…</p></Shell>;
  }

  if (user === null) {
    return (
      <Shell>
        {loginFailed && <p className="mb-3 text-red-600">Login failed. Please try again.</p>}
        <p className="mb-4 text-neutral-700">Login with your NITK IRIS account to buy merch.</p>
        <button
          type="button"
          onClick={handleLogin}
          className="rounded bg-neutral-900 px-5 py-2 text-white hover:bg-neutral-700"
        >
          Login with IRIS
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="mb-6 text-sm text-neutral-500">Logged in as {user.name || user.email}</p>

      {loadError && <p className="mb-4 text-red-600">{loadError}</p>}
      {!loadError && groups.length === 0 && (
        <p className="text-neutral-500">No products available yet.</p>
      )}

      <div className="space-y-4">
        {groups.map((group) => {
          const count = unitCount(group);

          return (
            <div key={group.key} className="rounded border border-neutral-300 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{group.name}</h2>
                  <p className="text-sm text-neutral-600">
                    {isEarlyBird ? (
                      <>
                        <span className="line-through text-red-600 mr-1.5">{rupees(group.unitPrice)}</span>
                        <span className="font-bold text-emerald-700">{rupees(Math.max(1, group.unitPrice - 30))} each</span>
                      </>
                    ) : (
                      `${rupees(group.unitPrice)} each`
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Remove one ${group.name}`}
                    onClick={() => setQuantity(group, count - 1)}
                    disabled={count === 0}
                    className="h-8 w-8 rounded border border-neutral-400 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-6 text-center tabular-nums">{count}</span>
                  <button
                    type="button"
                    aria-label={`Add one ${group.name}`}
                    onClick={() => setQuantity(group, count + 1)}
                    disabled={count >= group.maxQuantity}
                    className="h-8 w-8 rounded border border-neutral-400 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {count > 0 && (
                <div className="mt-3 space-y-2">
                  {(sizes[group.key] || []).map((size, i) => (
                    <label key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-16 text-neutral-600">Shirt {i + 1}</span>
                      <select
                        value={size}
                        onChange={(e) => setUnitSize(group, i, e.target.value)}
                        className="rounded border border-neutral-300 px-2 py-1"
                      >
                        <option value="">Select size</option>
                        {group.variants.map((v) => (
                          <option key={v.id} value={v.size}>
                            {v.size}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Coupon */}
      <div className="mt-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
          Early Bird Coupon Code
        </label>
        <div className="flex gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Coupon code (e.g. POORVAPAKSHI)"
            maxLength={32}
            className="flex-1 rounded border border-neutral-300 px-3 py-2 uppercase font-semibold"
          />
          <button
            type="button"
            onClick={() => setAppliedCoupon(coupon.trim().toUpperCase())}
            className="rounded bg-neutral-900 px-4 py-2 text-white font-semibold hover:bg-neutral-700"
          >
            Apply
          </button>
          {appliedCoupon && (
            <button
              type="button"
              onClick={() => {
                setAppliedCoupon("");
                setCoupon("");
              }}
              className="rounded border border-neutral-300 px-3 py-2 text-neutral-600 hover:bg-neutral-100"
            >
              Remove
            </button>
          )}
        </div>
        {appliedCoupon && isEarlyBird && (
          <div className="mt-2 rounded bg-emerald-50 border border-emerald-300 p-2.5 text-xs font-bold text-emerald-800">
            🎉 Early Bird Coupon Applied! (Regular fit: ₹299, Oversized fit: ₹369).
          </div>
        )}
      </div>

      {/* Phone */}
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder="Mobile number (10 digits)"
        inputMode="numeric"
        className="mt-3 w-full rounded border border-neutral-300 px-3 py-2"
      />
      {phone && !phoneValid && (
        <p className="mt-1 text-sm text-red-600">Enter a valid 10-digit Indian mobile number</p>
      )}

      {/* Summary */}
      <div className="mt-6 rounded border border-neutral-300 bg-white p-4 text-sm">
        {missingSize && <p className="text-amber-700">Select a size for every shirt.</p>}
        {!missingSize && cartItems.length === 0 && (
          <p className="text-neutral-500">Add a shirt to see the price.</p>
        )}
        {quoteError && <p className="text-red-600">{quoteError}</p>}

        {quote && (
          <div className="space-y-1">
            {quote.items.map((it) => (
              <div key={it.productId} className="flex justify-between">
                <span>{itemLabel(it)}</span>
                <span>
                  {quote.discount > 0 || isEarlyBird ? (
                    <>
                      <span className="line-through text-red-600 mr-1.5 text-xs">{rupees(it.unitPrice * it.quantity)}</span>
                      <span className="font-semibold text-emerald-700">{rupees(it.lineTotal)}</span>
                    </>
                  ) : (
                    rupees(it.lineTotal)
                  )}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-1">
              <span>Subtotal</span>
              <span>{rupees(quote.subtotal)}</span>
            </div>
            {(quote.discount > 0 || isEarlyBird) && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Early Bird Coupon ({appliedCoupon})</span>
                <span>−{rupees(quote.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{rupees(quote.total)}</span>
            </div>
          </div>
        )}
      </div>

      {payError && <p className="mt-3 text-red-600">{payError}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={!canPay}
        className="mt-4 w-full rounded bg-neutral-900 py-3 font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {paying ? "Redirecting…" : quote ? `Pay ${rupees(quote.total)}` : "Pay"}
      </button>

      <p className="mt-3 text-center text-xs text-neutral-400">
        Test page · Cashfree {CASHFREE_MODE}
      </p>
    </Shell>
  );
};

const Shell = ({ children }) => (
  <div className="min-h-screen bg-neutral-100 px-4 py-10">
    <div className="mx-auto max-w-xl">
      <div className="mb-1 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Merch</h1>
        <Link to="/my-orders" className="text-sm underline">
          My orders
        </Link>
      </div>
      {children}
    </div>
  </div>
);

export default MerchTest;
