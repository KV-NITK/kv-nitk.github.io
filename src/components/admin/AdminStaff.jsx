import React, { useCallback, useEffect, useMemo, useState } from "react";
import { addStaff, listStaff, updateStaff } from "../../api/staffAdmin";

const PASS_KEY = "admin_staff_pass";

const ROLE_LABELS = { ADMIN: "Admin", VOLUNTEER: "Volunteer" };

const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

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
    // ignore
  }
};

const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
  </div>
);

const EMPTY_FORM = { irisId: "", name: "", role: "VOLUNTEER", active: true };

const AdminStaff = () => {
  const [passcode, setPasscode] = useState(readPass);
  const [passInput, setPassInput] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showInactive, setShowInactive] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [formMessage, setFormMessage] = useState(null); // { ok, text }
  const [saving, setSaving] = useState({}); // irisId -> true while a change is being saved
  const [rowError, setRowError] = useState({}); // irisId -> message

  const load = useCallback(async (pass) => {
    setLoading(true);
    setError("");

    try {
      setData(await listStaff(pass));
      setPasscode(pass);
      writePass(pass);
    } catch (e) {
      setData(null);
      setError(e.message);
      if (e.status === 401) writePass("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (passcode) load(passcode);
  }, []);

  const lock = () => {
    writePass("");
    setPasscode("");
    setPassInput("");
    setData(null);
    setError("");
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    setFormMessage(null);
    setAdding(true);

    try {
      const created = await addStaff(passcode, {
        irisId: form.irisId.trim(),
        name: form.name.trim(),
        role: form.role,
        active: form.active,
      });

      setData((d) => ({ ...d, staff: [created, ...d.staff] }));
      setForm(EMPTY_FORM);
      setFormMessage({ ok: true, text: `${created.name} added as ${ROLE_LABELS[created.role]}.` });
    } catch (err) {
      setFormMessage({ ok: false, text: err.message });
      if (err.status === 401) lock();
    } finally {
      setAdding(false);
    }
  };

  const change = async (member, changes) => {
    setSaving((s) => ({ ...s, [member.irisId]: true }));
    setRowError((r) => ({ ...r, [member.irisId]: "" }));

    try {
      const updated = await updateStaff(passcode, member.irisId, changes);

      // Keep the claim totals, which the update does not return
      setData((d) => ({
        ...d,
        staff: d.staff.map((s) => (s.irisId === updated.irisId ? { ...s, ...updated, foodClaims: s.foodClaims, merchClaims: s.merchClaims, reverts: s.reverts, lastActionAt: s.lastActionAt } : s)),
      }));
    } catch (err) {
      setRowError((r) => ({ ...r, [member.irisId]: err.message }));
      if (err.status === 401) lock();
    } finally {
      setSaving((s) => ({ ...s, [member.irisId]: false }));
    }
  };

  const staff = data?.staff || [];

  const summary = useMemo(() => {
    const active = staff.filter((s) => s.active);

    return {
      admins: active.filter((s) => s.role === "ADMIN").length,
      volunteers: active.filter((s) => s.role === "VOLUNTEER").length,
      inactive: staff.length - active.length,
    };
  }, [staff]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();

    return staff.filter((s) => {
      if (!showInactive && !s.active) return false;
      if (roleFilter !== "ALL" && s.role !== roleFilter) return false;
      if (!q) return true;
      return [s.name, s.irisId].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [staff, search, roleFilter, showInactive]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4 font-sans">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passInput.trim()) load(passInput.trim());
          }}
          className="w-full max-w-sm rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-bold text-neutral-900">Event staff</h1>
          <p className="mt-1 text-sm text-neutral-600">Enter the staff admin password.</p>
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Password"
            autoFocus
            className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
          />
          {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-black px-4 py-2 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Checking…" : "Open"}
          </button>
        </form>
      </div>
    );
  }

  const inputClass =
    "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400 shadow-sm placeholder:text-neutral-400";
  const formValid = /^\d{7}$/.test(form.irisId.trim()) && form.name.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4 font-sans text-neutral-900 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Event staff</h1>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => load(passcode)}
              disabled={loading}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50 shadow-sm disabled:opacity-60 transition-colors"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={lock}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 shadow-sm transition-colors"
            >
              Lock
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Admins" value={summary.admins} />
          <StatCard label="Volunteers" value={summary.volunteers} />
          <StatCard label="Inactive" value={summary.inactive} />
        </div>

        {/* Add staff */}
        <form onSubmit={submitAdd} className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold">Add staff</h2>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-neutral-500">
              IRIS ID
              <input
                value={form.irisId}
                onChange={(e) => setForm((f) => ({ ...f, irisId: e.target.value.replace(/\D/g, "").slice(0, 7) }))}
                inputMode="numeric"
                placeholder="7 digits"
                className={`${inputClass} w-32`}
              />
            </label>
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold text-neutral-500">
              Name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={80}
                placeholder="Full name"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-neutral-500">
              Role
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className={inputClass}
              >
                <option value="VOLUNTEER">Volunteer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="size-4"
              />
              Active
            </label>
            <button
              type="submit"
              disabled={adding || !formValid}
              className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Admins can scan and also revert a claim. Volunteers can scan but cannot revert. The added time is set automatically.
          </p>
          {formMessage && (
            <p role="alert" className={`mt-2 text-sm font-semibold ${formMessage.ok ? "text-green-700" : "text-red-700"}`}>
              {formMessage.text}
            </p>
          )}
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or IRIS ID"
            className={`${inputClass} min-w-56 flex-1`}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Role" className={inputClass}>
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admins</option>
            <option value="VOLUNTEER">Volunteers</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="size-4" />
            Show inactive
          </label>
          <span className="whitespace-nowrap text-sm font-medium text-neutral-500">{shown.length} of {staff.length}</span>
        </div>

        {!data.statsAvailable && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Claim counts are unavailable: the pass_events migration has not been run on this database.
          </p>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-sm">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <tr>
                {["Name", "IRIS ID", "Role", "Active", "Food", "Merch", "Reverts", "Last scan", "Added"].map((h) => (
                  <th key={h} className="px-4 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {shown.map((s) => (
                <tr key={s.irisId} className={s.active ? "" : "bg-neutral-50 text-neutral-400"}>
                  <td className="px-4 py-3 font-semibold">
                    {s.name || <span className="font-normal italic text-neutral-400">no name</span>}
                    {rowError[s.irisId] && <p role="alert" className="mt-0.5 text-xs font-semibold text-red-700">{rowError[s.irisId]}</p>}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{s.irisId}</td>
                  <td className="px-4 py-3">
                    <select
                      value={s.role}
                      disabled={saving[s.irisId]}
                      onChange={(e) => change(s, { role: e.target.value })}
                      aria-label={`Role of ${s.name || s.irisId}`}
                      className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 disabled:opacity-60"
                    >
                      <option value="VOLUNTEER">Volunteer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={s.active}
                      aria-label={`${s.name || s.irisId} active`}
                      disabled={saving[s.irisId]}
                      onClick={() => change(s, { active: !s.active })}
                      className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${s.active ? "bg-green-600" : "bg-neutral-300"}`}
                    >
                      <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${s.active ? "translate-x-5" : ""}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{s.foodClaims}</td>
                  <td className="px-4 py-3 tabular-nums">{s.merchClaims}</td>
                  <td className="px-4 py-3 tabular-nums">{s.reverts}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(s.lastActionAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(s.createdAt)}</td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-neutral-400">No staff match.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-400">
          Food and Merch count every claim the person made, including ones an admin reverted later. A change to role or active applies to the scanner immediately. Times are IST.
        </p>
      </div>
    </div>
  );
};

export default AdminStaff;
