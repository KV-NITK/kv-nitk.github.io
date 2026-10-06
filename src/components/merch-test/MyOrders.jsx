import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API_URL from "../../api/api";
import { getMyPayments, getPayment } from "../../api/payments";
import { STATUS_STYLES, itemLabel, rupees } from "./orderFormat";

// Unfinished orders are re-checked with Cashfree on load (the webhook may be late)
const MAX_AUTO_REFRESH = 5;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "";

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || { label: status, className: "bg-neutral-200 text-neutral-700" };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.className}`}>
      {style.label}
    </span>
  );
};

const MyOrders = () => {
  const [searchParams] = useSearchParams();
  const loginFailed = searchParams.has("login_error");
  const [user, setUser] = useState(undefined); // undefined = checking, null = logged out
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(() => new Set());

  const refreshOrder = useCallback(async (paymentId) => {
    setRefreshing((prev) => new Set(prev).add(paymentId));

    try {
      const updated = await getPayment(paymentId);
      setOrders((prev) => prev?.map((o) => (o.paymentId === paymentId ? updated : o)));
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing((prev) => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        const data = res.ok ? await res.json() : null;

        if (cancelled) return;

        if (!data?.success || !data.user) {
          setUser(null);
          return;
        }

        setUser(data.user);

        const list = await getMyPayments();
        if (cancelled) return;

        setOrders(list);

        list
          .filter((o) => o.status === "PENDING")
          .slice(0, MAX_AUTO_REFRESH)
          .forEach((o) => refreshOrder(o.paymentId));
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshOrder]);

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/iris?redirect=/my-orders`;
  };

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">My orders</h1>
          <Link to="/parva-26/merch" className="text-sm underline">
            Back to merch
          </Link>
        </div>

        {user === undefined && !error && <p className="text-neutral-500">Loading…</p>}

        {user === null && (
          <div>
            {loginFailed && <p className="mb-3 text-red-600">Login failed. Please try again.</p>}
            <p className="mb-4 text-neutral-700">Login with your NITK IRIS account to see your orders.</p>
            <button
              type="button"
              onClick={handleLogin}
              className="rounded bg-neutral-900 px-5 py-2 text-white hover:bg-neutral-700"
            >
              Login with IRIS
            </button>
          </div>
        )}

        {error && <p className="mb-4 text-red-600">{error}</p>}

        {orders && orders.length === 0 && <p className="text-neutral-500">You have no orders yet.</p>}

        <div className="space-y-4">
          {orders?.map((order) => {
            const isRefreshing = refreshing.has(order.paymentId);

            return (
              <div key={order.paymentId} className="rounded border border-neutral-300 bg-white p-4 text-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{formatDate(order.createdAt)}</span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="space-y-1">
                  {order.items.length === 0 && <p className="text-neutral-500">Order details unavailable</p>}
                  {order.items.map((it) => (
                    <div key={it.productId} className="flex justify-between">
                      <span>{itemLabel(it)}</span>
                      <span>{rupees(it.lineTotal)}</span>
                    </div>
                  ))}

                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Coupon {order.couponCode}</span>
                      <span>−{rupees(order.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>Total</span>
                    <span>{rupees(order.amount)}</span>
                  </div>
                </div>

                {order.status === "SUCCESS" && order.paidAt && (
                  <p className="mt-2 text-xs text-neutral-500">Paid on {formatDate(order.paidAt)}</p>
                )}

                {(order.status === "FAILED" || order.status === "CANCELLED") && order.failureReason && (
                  <p className="mt-2 text-xs text-neutral-500">{order.failureReason}</p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">Order {order.orderId}</span>

                  {order.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => refreshOrder(order.paymentId)}
                      disabled={isRefreshing}
                      className="ml-3 shrink-0 rounded border border-neutral-400 px-2 py-1 text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                    >
                      {isRefreshing ? "Checking…" : "Check status"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
