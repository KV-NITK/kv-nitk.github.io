import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getAllOrders } from "../../api/admin";
import { shirtName } from "@/lib/shirtName";
import { STATUS_STYLES, discountParts, itemLabel, rupees } from "../merch-test/orderFormat";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const PASS_KEY = "admin_orders_pass";

const STATUS_FILTERS = [
  ["SUCCESS", "Paid"],
  ["ALL", "All"],
  ["PENDING", "Pending"],
  ["CREATED", "Not paid"],
  ["FAILED", "Failed"],
];

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

const variantOf = (it) => it.variant || (it.productId.includes("-") ? it.productId.split("-").pop().toUpperCase() : "");

const isShirt = (it) => it.category === "MERCH" || /^tshirt/.test(it.productId);

const readPass = () => {
  try {
    return sessionStorage.getItem(PASS_KEY) || "";
  } catch {
    return "";
  }
};

const writePass = (value) => {
  try {
    if (value) sessionStorage.setItem(PASS_KEY, value);
    else sessionStorage.removeItem(PASS_KEY);
  } catch {
    // the page works without remembering the password
  }
};

// The saved discount split into what the coupon took off and the free goodie
const discountOf = (order) => {
  const parts = discountParts(order);
  const coupon = parts.find((p) => p.label !== "Goodie (free)")?.amount ?? 0;
  const goodie = parts.find((p) => p.label === "Goodie (free)")?.amount ?? 0;
  return { coupon, goodie };
};

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (orders) => {
  const header = ["Date", "Order ID", "Name", "Phone", "Email", "IRIS ID", "Items", "Coupon", "Subtotal", "Coupon discount", "Goodie discount", "Amount", "Status"];
  const rows = orders.map((o) => [
    formatDate(o.createdAt), o.orderId, o.name, o.phone, o.email, o.irisId,
    o.items.map(itemLabel).join("; "), o.couponCode, o.subtotal, discountOf(o).coupon, discountOf(o).goodie, o.amount, o.status,
  ]);
  const text = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || { label: status, className: "bg-neutral-200 text-neutral-700" };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.className}`}>{style.label}</span>;
};

const Stat = ({ label, value }) => (
  <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
    <div className="mt-1 text-2xl font-bold text-neutral-900">{value}</div>
  </div>
);

const AdminOrders = () => {
  const [passcode, setPasscode] = useState(readPass);
  const [passInput, setPassInput] = useState("");
  const [orders, setOrders] = useState(null); // null = locked
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("SUCCESS");
  const [search, setSearch] = useState("");

  const load = useCallback(async (pass) => {
    setLoading(true);
    setError("");

    try {
      setOrders(await getAllOrders(pass));
      setPasscode(pass);
      writePass(pass);
    } catch (e) {
      setOrders(null);
      setError(e.message);
      if (e.status === 401) writePass("");
    } finally {
      setLoading(false);
    }
  }, []);

  // A password kept from earlier in this tab unlocks the page again
  useEffect(() => {
    if (passcode) load(passcode);
  }, []);

  const lock = () => {
    writePass("");
    setPasscode("");
    setPassInput("");
    setOrders(null);
    setError("");
  };

  const paid = useMemo(() => (orders || []).filter((o) => o.status === "SUCCESS"), [orders]);

  const summary = useMemo(() => {
    const counted = { shirts: 0, goodies: 0 };
    const perItem = new Map();

    for (const order of paid) {
      for (const it of order.items) {
        if (it.productId === "goodie") counted.goodies += it.quantity;
        else if (isShirt(it)) counted.shirts += it.quantity;

        const name = shirtName(it.productId, it.name);
        const key = `${name}|${variantOf(it)}`;
        const row = perItem.get(key) || { name, variant: variantOf(it), quantity: 0 };
        row.quantity += it.quantity;
        perItem.set(key, row);
      }
    }

    const rows = [...perItem.values()].sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        (SIZE_ORDER.indexOf(a.variant) + 1 || 99) - (SIZE_ORDER.indexOf(b.variant) + 1 || 99)
    );

    return {
      ...counted,
      rows,
      revenue: paid.reduce((n, o) => n + o.amount, 0),
      withCoupon: paid.filter((o) => o.couponCode).length,
    };
  }, [paid]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (orders || []).filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!q) return true;
      return [o.name, o.phone, o.email, o.irisId, o.orderId, o.couponCode].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [orders, status, search]);

  if (!orders) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passInput.trim()) load(passInput.trim());
          }}
          className="w-full max-w-sm rounded-xl bg-white p-6 shadow"
        >
          <h1 className="text-xl font-bold text-neutral-900">Admin</h1>
          <p className="mt-1 text-sm text-neutral-600">Enter the password to see the orders.</p>
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Password"
            autoFocus
            className="mt-4 w-full rounded border border-neutral-300 px-3 py-2"
          />
          {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded bg-neutral-900 px-4 py-2 font-semibold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            {loading ? "Checking…" : "View orders"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
          <div className="flex gap-2">
            <button onClick={() => load(passcode)} disabled={loading} className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-60">
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button onClick={() => downloadCsv(shown)} className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50">
              Download CSV ({shown.length})
            </button>
            <button onClick={lock} className="rounded bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-700">
              Lock
            </button>
          </div>
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Paid orders" value={paid.length} />
          <Stat label="Revenue" value={rupees(summary.revenue)} />
          <Stat label="Shirts" value={summary.shirts} />
          <Stat label="Goodies" value={summary.goodies} />
          <Stat label="With a coupon" value={summary.withCoupon} />
        </div>

        {summary.rows.length > 0 && (
          <details className="mt-4 rounded-lg border border-neutral-200 bg-white p-4" open>
            <summary className="cursor-pointer font-semibold text-neutral-900">What to hand out (paid orders)</summary>
            <ul className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {summary.rows.map((row) => (
                <li key={`${row.name}|${row.variant}`} className="flex justify-between border-b border-neutral-100 py-1">
                  <span>{row.name}{row.variant ? ` (${row.variant})` : ""}</span>
                  <span className="font-bold">{row.quantity}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm">
            {STATUS_FILTERS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email, IRIS id, order id, coupon"
            className="min-w-64 flex-1 rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
          <span className="text-sm text-neutral-600">{shown.length} of {orders.length} orders</span>
        </div>
        <p className="mt-1 text-xs text-neutral-500">Status is as last saved. A Pending order may already be paid at Cashfree if its confirmation has not arrived.</p>

        <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                {["Date", "Name", "Phone", "Email", "Items", "Coupon", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o.paymentId} className="border-t border-neutral-100 align-top">
                  <td className="whitespace-nowrap px-3 py-2">{formatDate(o.createdAt)}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">{o.name || "—"}</div>
                    <div className="text-xs text-neutral-500">{o.irisId}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{o.phone || "—"}</td>
                  <td className="px-3 py-2">{o.email || "—"}</td>
                  <td className="px-3 py-2">
                    {o.items.length ? o.items.map((it) => <div key={it.productId}>{itemLabel(it)}</div>) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {o.couponCode ? <>{o.couponCode}<div className="text-xs text-neutral-500">−{rupees(discountOf(o).coupon)}</div></> : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold">{rupees(o.amount)}</td>
                  <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-neutral-500">No orders match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
