import React, { useMemo, useState } from "react";
import { getAllOrders } from "../../api/admin";
import { shirtDesign, shirtName } from "@/lib/shirtName";
import { STATUS_STYLES, discountParts, itemLabel, rupees } from "../merch-test/orderFormat";
import { PasswordGate, RefreshError, StatCard, usePasscodeData } from "./shared";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const PASS_KEY = "admin_orders_pass";

const STATUS_FILTERS = [
  ["SUCCESS", "Paid"],
  ["ALL", "All"],
  ["PENDING", "Pending"],
  ["CREATED", "Not paid"],
  ["FAILED", "Failed"],
];

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const isShirt = (it) => it.category === "MERCH" || /^tshirt/.test(it.productId);

// Only shirt ids end in a size; a food coupon (bhoori-bhojana) has none
const variantOf = (it) => it.variant || (isShirt(it) && it.productId.includes("-") ? it.productId.split("-").pop().toUpperCase() : "");

const isFood = (it) => it.category === "FOOD";

// Food coupons are sold on their own, so an order is one or the other
const isFoodOrder = (order) => order.items.some(isFood);

const TYPE_FILTERS = [
  ["ALL", "Merch and food"],
  ["MERCH", "Merch only"],
  ["FOOD", "Food coupons only"],
];

const discountOf = (order) => {
  const parts = discountParts(order);
  const coupon = parts.find((p) => p.label !== "Goodie (free)")?.amount ?? 0;
  const goodie = parts.find((p) => p.label === "Goodie (free)")?.amount ?? 0;
  return { coupon, goodie };
};

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (orders) => {
  const header = ["Date", "Order ID", "Type", "Name", "Phone", "Email", "IRIS ID", "Items", "Coupon", "Subtotal", "Coupon discount", "Goodie discount", "Amount", "Status"];
  const rows = orders.map((o) => [
    formatDate(o.createdAt), o.orderId, isFoodOrder(o) ? "Food coupons" : "Merch", o.name, o.phone, o.email, o.irisId,
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
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${style.className}`}>
      {style.label}
    </span>
  );
};

const AdminOrders = () => {
  const { passcode, data: orders, loading, error, load, lock } = usePasscodeData(PASS_KEY, getAllOrders);
  const [status, setStatus] = useState("SUCCESS");
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");

  const paid = useMemo(() => (orders || []).filter((o) => o.status === "SUCCESS"), [orders]);

  const summary = useMemo(() => {
    const counted = { shirts: 0, goodies: 0, regular: 0, oversized: 0, food: 0 };
    const perItem = new Map();

    for (const order of paid) {
      for (const it of order.items) {
        if (it.productId === "goodie") counted.goodies += it.quantity;
        else if (isFood(it)) counted.food += it.quantity;
        else if (isShirt(it)) counted.shirts += it.quantity;

        const design = shirtDesign(it.productId);
        if (design) counted[design] += it.quantity;

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
      foodRevenue: paid.filter(isFoodOrder).reduce((n, o) => n + o.amount, 0),
      withCoupon: paid.filter((o) => o.couponCode).length,
    };
  }, [paid]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (orders || []).filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (type !== "ALL" && isFoodOrder(o) !== (type === "FOOD")) return false;
      if (!q) return true;
      return [o.name, o.phone, o.email, o.irisId, o.orderId, o.couponCode].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [orders, status, type, search]);

  if (!orders) {
    return (
      <PasswordGate
        title="Admin"
        prompt="Enter the password to see the orders."
        submitLabel="View orders"
        loading={loading}
        error={error}
        onSubmit={load}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 md:p-8 font-sans text-neutral-900">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Orders</h1>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => load(passcode)}
              disabled={loading}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 shadow-sm disabled:opacity-60 transition-colors"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => downloadCsv(shown)}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 shadow-sm transition-colors"
            >
              Download CSV ({shown.length})
            </button>
            <button
              onClick={lock}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 shadow-sm transition-colors"
            >
              Lock
            </button>
          </div>
        </div>
        <RefreshError error={error} />

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Paid orders" value={paid.length} />
          <StatCard label="Revenue" value={rupees(summary.revenue)} />
          <StatCard label="Merch revenue" value={rupees(summary.revenue - summary.foodRevenue)} />
          <StatCard label="Food revenue" value={rupees(summary.foodRevenue)} />
          <StatCard label="Food coupons" value={summary.food} />
          <StatCard label="Shirts" value={summary.shirts} />
          <StatCard label="Regular" value={summary.regular} />
          <StatCard label="Oversized" value={summary.oversized} />
          <StatCard label="Goodies" value={summary.goodies} />
          <StatCard label="With a coupon" value={summary.withCoupon} />
        </div>

        {/* Hand out section */}
        {summary.rows.length > 0 && (
          <details className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm" open>
            <summary className="cursor-pointer font-bold text-neutral-900 text-base flex items-center gap-2 select-none outline-none">
              What to hand out (paid orders)
            </summary>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-2 text-sm">
              {summary.rows.map((row) => (
                <div key={`${row.name}|${row.variant}`} className="flex justify-between items-center py-1 border-b border-neutral-100 last:border-b-0 md:border-b-0">
                  <span className="text-neutral-800 font-medium">{row.name}{row.variant ? ` (${row.variant})` : ""}</span>
                  <span className="font-bold text-neutral-900">{row.quantity}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Filters & Search */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-neutral-400 shadow-sm"
            >
              {STATUS_FILTERS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Order type"
              className="rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-neutral-400 shadow-sm"
            >
              {TYPE_FILTERS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, email, IRIS id, order id, coupon"
              className="min-w-64 flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400 shadow-sm placeholder:text-neutral-400"
            />
            <span className="text-sm font-medium text-neutral-500 whitespace-nowrap">{shown.length} of {orders.length} orders</span>
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">
            Status is as last saved. A Pending order may already be paid at Cashfree if its confirmation has not arrived.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-sm">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-neutral-50/70 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <tr>
                {["Date", "Name", "Phone", "Email", "Items", "Coupon", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {shown.map((o) => (
                <tr key={o.paymentId} className="align-top hover:bg-neutral-50/50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3.5 text-neutral-600 font-medium text-xs sm:text-sm">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-neutral-900">{o.name || "—"}</div>
                    <div className="text-xs text-neutral-400 mt-0.5 font-normal">{o.irisId}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-medium text-neutral-800">{o.phone || "—"}</td>
                  <td className="px-4 py-3.5 font-medium text-neutral-800">{o.email || "—"}</td>
                  <td className="px-4 py-3.5 font-medium text-neutral-800 space-y-0.5">
                    {isFoodOrder(o) && <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Food</span>}
                    {o.items.length ? o.items.map((it) => <div key={it.productId}>{itemLabel(it)}</div>) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {o.couponCode ? (
                      <div>
                        <div className="font-semibold text-neutral-900 uppercase tracking-wider text-xs">{o.couponCode}</div>
                        <div className="text-xs text-neutral-400 font-normal mt-0.5">-₹{discountOf(o).coupon.toFixed(2)}</div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-bold text-neutral-900">{rupees(o.amount)}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-neutral-400 font-medium">No orders match.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
