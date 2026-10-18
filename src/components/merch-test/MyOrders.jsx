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

const passName = (pass) => `${pass.category === "FOOD" ? "Food coupon" : pass.item_name}${pass.variant ? ` (${pass.variant})` : ""} #${pass.item_index}`;

const passState = (pass) =>
  pass.status === "CLAIMED"
    ? `Used${pass.claimed_at ? ` · ${formatDate(pass.claimed_at)}` : ""}`
    : pass.status === "VOID"
      ? "Void"
      : "Not used yet";

// One pass per food coupon or shirt, as a ticket. The QR code is only made
// when the ticket is opened, so the page never shows them all at once.
const PassTicket = ({ pass, onOpen }) => {
  const usable = pass.status === "ISSUED";

  return (
    <button
      type="button"
      onClick={() => onOpen(pass)}
      className={cn(
        "flex flex-col items-center gap-1 rounded-[6px] border-2 border-dashed bg-white px-2 py-3 text-center transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a5530]",
        usable ? "border-[#8a5530]" : "border-[#c2aa84] opacity-55"
      )}
    >
      <QrIcon className="size-10 text-[#4a2a12]" />
      <span className="text-xs font-bold">{passName(pass)}</span>
      <span className={cn("text-xs font-semibold", usable ? "text-emerald-800" : "text-red-700")}>{passState(pass)}</span>
      {usable && <span className="mt-1 rounded-full bg-[#8a5530] px-3 py-1 text-xs font-bold text-[#f3ead5]">Show QR</span>}
    </button>
  );
};

const QrIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h4v2h-4v-2zm-4 4h2v2h-2v-2zm4 0h4v4h-2v-2h-2v-2zm-2 2h2v2h-2v-2z" />
  </svg>
);

// The QR code of one pass, made when it is opened, with the rules beside it.
const PassQr = ({ pass, onClose }) => {
  const [src, setSrc] = useState("");
  const usable = pass.status === "ISSUED";

  useEffect(() => {
    if (!usable) return;
    QRCode.toDataURL(pass.token, { width: 640, margin: 2, errorCorrectionLevel: "M" }).then(setSrc).catch(() => setSrc(""));
  }, [pass.token, usable]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={passName(pass)}
        className="relative w-full max-w-sm rounded-[8px] bg-[#f3ead5] p-5 text-center font-kn-body text-[#4a2a12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/10 font-bold hover:bg-black/20"
        >
          ✕
        </button>
        <h3 className="font-poster text-2xl leading-none">{passName(pass)}</h3>
        <p className={cn("mt-1 text-sm font-bold", usable ? "text-emerald-800" : "text-red-700")}>{passState(pass)}</p>

        {usable ? (
          <>
            <div className="mx-auto mt-4 aspect-square w-full max-w-[18rem] rounded-[6px] bg-white p-2">
              {src && <img src={src} alt={`QR code for ${passName(pass)}`} className="size-full [image-rendering:pixelated]" />}
            </div>
            <div role="note" className="mt-4 rounded border-2 border-red-300 bg-red-50 p-3 text-left text-sm text-red-900">
              <p className="font-bold">Do not share this QR code with anyone.</p>
              <p className="mt-1">It can be scanned only once. Whoever shows it first gets the {pass.category === "FOOD" ? "meal" : "item"}, so show it only at the counter.</p>
              <p lang="kn" className="mt-2 font-semibold">
                ಈ QR ಕೋಡ್ ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ಇದನ್ನು ಒಮ್ಮೆ ಮಾತ್ರ ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತದೆ.
              </p>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm">This pass has already been {pass.status === "VOID" ? "cancelled" : "used"}, so it has no QR code.</p>
        )}
      </div>
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
  const [openPass, setOpenPass] = useState(null);
  const closePass = useCallback(() => setOpenPass(null), []);

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
                        <En>
                          {food ? "One QR code per coupon. Tap one at the food counter to show it." : "Tap a pass to show its QR code when you collect your merch."} Each works once; do not share them. ·{" "}
                        </En>
                        <span lang="kn" className="font-semibold">
                          ಪ್ರತಿ QR ಒಮ್ಮೆ ಮಾತ್ರ; ಹಂಚಿಕೊಳ್ಳಬೇಡಿ
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {orderPasses.map((p) => (
                          <PassTicket key={p.id} pass={p} onOpen={setOpenPass} />
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
      {openPass && <PassQr pass={openPass} onClose={closePass} />}
    </PageShell>
  );
};

export default MyOrders;
