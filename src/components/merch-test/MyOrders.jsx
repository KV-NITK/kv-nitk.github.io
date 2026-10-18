import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { PageShell } from "@p26/chrome/page-shell";
import { En } from "@p26/lib/prefs";
import { cn } from "@/lib/utils";
import API_URL from "../../api/api";
import { getMyPasses, getMyPayments, getPayment } from "../../api/payments";
import { STATUS_STYLES, discountParts, itemLabel, rupees } from "./orderFormat";

// Unfinished orders are re-checked with Cashfree on load (the webhook may be late)
const MAX_AUTO_REFRESH = 5;

// Same brick wall as the merch shop
const BRICK = {
  backgroundColor: "#563520",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23452917' fill-opacity='0.8'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/svg%3E")`,
  backgroundSize: "84px 88px",
};

const FILTERS = [
  { id: "all", en: "All", kn: "ಎಲ್ಲಾ" },
  { id: "merch", en: "Merch", kn: "ಅಂಗಡಿ" },
  { id: "food", en: "Food coupons", kn: "ಊಟದ ಕೂಪನ್" },
];

const isFoodOrder = (order) => order.items.some((it) => it.category === "FOOD");

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || { label: status, className: "bg-neutral-200 text-neutral-700" };

  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.className}`}>{style.label}</span>;
};

const pill = "rounded-full bg-[#f3ead5] px-4 py-2 font-bold text-[#4a2a12] shadow-md transition-transform hover:-translate-y-0.5";

// One pass per food coupon or shirt: its QR code holds the token the scanner reads
const PassCard = ({ pass }) => {
  const [src, setSrc] = useState("");
  const claimed = pass.status === "CLAIMED";

  useEffect(() => {
    QRCode.toDataURL(pass.token, { width: 320, margin: 1 }).then(setSrc).catch(() => setSrc(""));
  }, [pass.token]);

  return (
    <div className={cn("flex flex-col items-center rounded-[6px] border-2 border-dashed bg-white p-2 text-center", claimed ? "border-[#c2aa84] opacity-55" : "border-[#8a5530]")}>
      {src ? <img src={src} alt={`QR code for ${pass.item_name}`} className="size-32" /> : <div className="size-32" />}
      <span className="mt-1 text-xs font-bold">
        {pass.category === "FOOD" ? "Food coupon" : pass.item_name}
        {pass.variant ? ` (${pass.variant})` : ""}
        {` · #${pass.item_index}`}
      </span>
      <span className={cn("text-xs font-semibold", claimed ? "text-red-700" : "text-emerald-800")}>
        {claimed ? `Used${pass.claimed_at ? ` · ${formatDate(pass.claimed_at)}` : ""}` : pass.status === "VOID" ? "Void" : "Not used yet"}
      </span>
    </div>
  );
};

const MyOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const loginFailed = searchParams.has("login_error");
  const filter = FILTERS.some((f) => f.id === searchParams.get("show")) ? searchParams.get("show") : "all";
  const [user, setUser] = useState(undefined); // undefined = checking, null = logged out
  const [orders, setOrders] = useState(null);
  const [passes, setPasses] = useState([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(() => new Set());

  const setFilter = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === "all") next.delete("show");
    else next.set("show", id);
    setSearchParams(next, { replace: true });
  };

  const refreshOrder = useCallback(async (paymentId) => {
    setRefreshing((prev) => new Set(prev).add(paymentId));

    try {
      const updated = await getPayment(paymentId);
      setOrders((prev) => prev?.map((o) => (o.paymentId === paymentId ? updated : o)));
      // A check that finds it paid issues its passes
      if (updated.status === "SUCCESS") setPasses(await getMyPasses());
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
        getMyPasses()
          .then((p) => !cancelled && setPasses(p))
          .catch(() => {});

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

  const counts = {
    all: orders?.length ?? 0,
    merch: orders?.filter((o) => !isFoodOrder(o)).length ?? 0,
    food: orders?.filter(isFoodOrder).length ?? 0,
  };
  const shown = orders?.filter((o) => filter === "all" || (filter === "food") === isFoodOrder(o));

  return (
    <PageShell title="ನನ್ನ ಆರ್ಡರ್‌ಗಳು · My Orders" topBar={{ home: "/rcb#parva-sante", ticket: false }}>
      <main className="flex min-h-screen justify-center p-4 pb-20 pt-24" style={BRICK}>
        <div className="w-full max-w-2xl">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link to="/parva-26/merch" className={pill}>
              Merch
            </Link>
            <Link to="/parva-26/coupon" className={pill}>
              Food coupons
            </Link>
          </div>

          <h1 className="mx-auto mt-6 w-fit rounded-[6px] bg-kumkuma px-8 pb-2 pt-1.5 text-center text-[#fff4dc] shadow-[inset_0_-3px_0_rgba(0,0,0,.2),0_0.5rem_1rem_rgba(0,0,0,.4)]">
            <span className="block font-poster text-3xl leading-none tracking-[0.2em]">My Orders</span>
            <span lang="kn" className="block font-kn-display text-base font-extrabold leading-tight text-arishina">
              ನನ್ನ ಆರ್ಡರ್‌ಗಳು
            </span>
          </h1>

          {user === undefined && !error && (
            <p role="status" className="mt-8 text-center font-poster text-xl text-[#f3ead5]">
              Loading…
            </p>
          )}

          {user === null && (
            <div className="mx-auto mt-8 max-w-md rounded-[8px] bg-[#f3ead5] p-5 text-center text-[#4a2a12] shadow-2xl">
              {loginFailed && <p className="mb-3 font-bold text-red-700">Login failed. Please try again.</p>}
              <p className="mb-4">Log in with IRIS to see your orders. You will come back to this page after logging in.</p>
              <button type="button" onClick={handleLogin} className="rounded bg-[#8a5530] px-5 py-2 font-bold text-[#f3ead5] transition-colors hover:bg-[#6b4020]">
                Login with IRIS
              </button>
            </div>
          )}

          {error && <p className="mt-6 rounded border border-red-300 bg-red-100 p-3 text-sm font-bold text-red-800">{error}</p>}

          {orders && (
            <div role="tablist" aria-label="Show orders" className="mt-8 flex flex-wrap justify-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 font-bold shadow-md ring-1 ring-[#c9a052]/50 transition-colors",
                    filter === f.id ? "bg-arishina text-theatre" : "bg-black/30 text-[#f3ead5] hover:bg-black/45"
                  )}
                >
                  <span className="leading-tight">
                    <En className="block">{f.en}</En>
                    <span lang="kn" className="block text-xs">
                      {f.kn}
                    </span>
                  </span>
                  <span className={cn("rounded-full px-2 text-xs tabular-nums", filter === f.id ? "bg-theatre/15" : "bg-[#f3ead5]/15")}>{counts[f.id]}</span>
                </button>
              ))}
            </div>
          )}

          {shown && shown.length === 0 && (
            <p className="mt-8 text-center font-poster text-xl text-[#f3ead5]">
              {filter === "food" ? "No food coupon orders yet." : filter === "merch" ? "No merch orders yet." : "You have no orders yet."}
            </p>
          )}

          <div className="mt-6 space-y-5">
            {shown?.map((order) => {
              const isRefreshing = refreshing.has(order.paymentId);
              const food = isFoodOrder(order);
              const orderPasses = passes.filter((p) => p.payment_id === order.paymentId).sort((a, b) => a.item_index - b.item_index);

              return (
                <article key={order.paymentId} className="rounded-[8px] bg-[#f3ead5] p-5 font-kn-body text-[#4a2a12] shadow-2xl">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-poster text-2xl leading-none">{food ? "Food coupons" : "Merch"}</h2>
                      <span lang="kn" className="text-sm font-bold">
                        {food ? "ಭೂರಿ ಭೋಜನ" : "ಪರ್ವ ಅಂಗಡಿ"}
                      </span>
                      <span className="block text-xs opacity-70">{formatDate(order.createdAt)}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <ul className="space-y-2 border-b border-[#c2aa84] pb-3">
                    {order.items.length === 0 && <li className="opacity-70">Order details unavailable</li>}
                    {order.items.map((it) => (
                      <li key={it.productId} className="flex items-baseline justify-between gap-3 rounded bg-[#e5d4b5] px-3 py-2">
                        <span className="font-bold">{itemLabel(it)}</span>
                        <span className="font-bold">
                          {it.listPrice > it.unitPrice && <s className="mr-1 text-xs font-normal text-red-700">{rupees(it.listPrice * it.quantity)}</s>}
                          {rupees(it.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-1 pt-3">
                    {discountParts(order).map((part) => (
                      <div key={part.label} className="flex justify-between text-sm font-semibold text-green-700">
                        <span>{part.label}</span>
                        <span>−{rupees(part.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{rupees(order.amount)}</span>
                    </div>
                  </div>

                  {order.status === "SUCCESS" && order.paidAt && <p className="mt-1 text-xs opacity-70">Paid on {formatDate(order.paidAt)}</p>}

                  {(order.status === "FAILED" || order.status === "CANCELLED") && order.failureReason && (
                    <p className="mt-2 text-xs opacity-70">{order.failureReason}</p>
                  )}

                  {order.status === "SUCCESS" && orderPasses.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-bold">
                        <En>{food ? "Show these at the food counter." : "Show these to collect your merch."} Each QR code works once. · </En>
                        <span lang="kn" className="font-semibold">
                          ಪ್ರತಿ QR ಒಮ್ಮೆ ಮಾತ್ರ
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {orderPasses.map((p) => (
                          <PassCard key={p.id} pass={p} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs opacity-60">
                    <span className="truncate">Order {order.orderId}</span>

                    {order.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => refreshOrder(order.paymentId)}
                        disabled={isRefreshing}
                        className="ml-3 shrink-0 rounded border border-[#8a5530] px-2 py-1 font-bold text-[#4a2a12] hover:bg-[#e5d4b5] disabled:opacity-50"
                      >
                        {isRefreshing ? "Checking…" : "Check status"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </PageShell>
  );
};

export default MyOrders;
