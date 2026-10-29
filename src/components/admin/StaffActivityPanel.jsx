import React, { useCallback, useEffect, useRef, useState } from "react";
import { addPassNote, getStaffActivity, revertClaim } from "../../api/staffAdmin";
import { Sheet } from "./shared";

// Full screen on a phone, a panel on the right on wider screens. Lists what one
// staff member claimed and reverted, with revert and notes per pass.

const CATEGORY_FILTERS = [
  ["", "All"],
  ["FOOD", "Food"],
  ["MERCH", "Merch"],
];

const ACTION_FILTERS = [
  ["", "All"],
  ["CLAIM", "Claims"],
  ["REVERT", "Reverts"],
];

const NOTE_STYLES = {
  NOTE: { label: "Note", className: "border-neutral-200 bg-neutral-50 text-neutral-700" },
  MISHANDLED: { label: "Mishandled", className: "border-red-200 bg-red-50 text-red-800" },
  REVERT_REASON: { label: "Revert reason", className: "border-amber-200 bg-amber-50 text-amber-900" },
};

const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "";

// Merch is shown by fit and size only (not the design name); food by its item name
const itemTitle = (a) =>
  a.category === "MERCH"
    ? [a.fit, a.size && `Size ${a.size}`].filter(Boolean).join(" · ") || "T-shirt"
    : a.itemName || "Food coupon";

const Segmented = ({ options, value, onChange, label }) => (
  <div role="group" aria-label={label} className="flex rounded-lg border border-neutral-300 bg-white p-0.5 text-sm font-semibold">
    {options.map(([v, text]) => (
      <button
        key={v || "all"}
        type="button"
        aria-pressed={value === v}
        onClick={() => onChange(v)}
        className={`min-h-9 flex-1 rounded-md px-3 transition-colors ${value === v ? "bg-black text-white" : "text-neutral-600"}`}
      >
        {text}
      </button>
    ))}
  </div>
);

const StatusBadge = ({ a }) => {
  let text = "Claimed";
  let className = "bg-green-100 text-green-800";

  if (a.action === "REVERT") {
    text = "Revert";
    className = "bg-amber-100 text-amber-900";
  } else if (a.revertedAt) {
    text = "Reverted";
    className = "bg-neutral-200 text-neutral-700";
  }

  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}>{text}</span>;
};

const RevertDialog = ({ item, onCancel, onDone }) => {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onDone(reason.trim());
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <Sheet title="Revert this claim?" onClose={busy ? () => {} : onCancel}>
      <p className="mt-1 text-sm text-neutral-600">
        {itemTitle(item)} for {item.holderName || item.holderIrisId}. It goes back to unclaimed so it can be scanned again.
      </p>
      <label className="mt-4 block text-sm font-semibold text-neutral-700">
        Reason <span className="font-normal text-neutral-400">(optional)</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="e.g. gave L instead of M, shirt returned"
          className="mt-1 w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </label>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 flex-1 rounded-lg border border-neutral-300 font-semibold disabled:opacity-60">
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={busy} className="min-h-11 flex-[1.4] rounded-lg bg-red-600 font-semibold text-white disabled:opacity-60">
          {busy ? "Reverting…" : reason.trim() ? "Revert" : "Skip reason & revert"}
        </button>
      </div>
    </Sheet>
  );
};

const NoteDialog = ({ item, onCancel, onDone }) => {
  const [note, setNote] = useState("");
  const [mishandled, setMishandled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onDone({ note: note.trim(), kind: mishandled ? "MISHANDLED" : "NOTE" });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Sheet title="Add a note" onClose={busy ? () => {} : onCancel}>
      <p className="mt-1 text-sm text-neutral-600">
        On {itemTitle(item)} for {item.holderName || item.holderIrisId}. Notes cannot be edited or deleted later.
      </p>
      <form onSubmit={submit}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          autoFocus
          placeholder="What happened?"
          className="mt-3 w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-neutral-400"
        />
        <label className="mt-2 flex min-h-11 items-center gap-3 text-sm font-medium text-neutral-800">
          <input type="checkbox" checked={mishandled} onChange={(e) => setMishandled(e.target.checked)} className="size-5" />
          Mark as mishandled (wrong item given, etc.)
        </label>
        {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 flex-1 rounded-lg border border-neutral-300 font-semibold disabled:opacity-60">
            Cancel
          </button>
          <button type="submit" disabled={busy || !note.trim()} className="min-h-11 flex-1 rounded-lg bg-black font-semibold text-white disabled:opacity-50">
            {busy ? "Saving…" : "Save note"}
          </button>
        </div>
      </form>
    </Sheet>
  );
};

const ActivityCard = ({ a, onRevert, onNote }) => (
  <article className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          {a.category === "FOOD" ? "Food" : "Merch"}{a.action === "REVERT" ? " · reverted a claim" : ""}
        </p>
        <p className="mt-0.5 font-semibold text-neutral-900">{itemTitle(a)}</p>
      </div>
      <StatusBadge a={a} />
    </div>

    <p className="mt-2 text-sm text-neutral-700">
      {a.holderName || "Unknown"}{a.holderIrisId ? <span className="text-neutral-400"> · {a.holderIrisId}</span> : null}
    </p>
    <p className="mt-1 text-[15px] font-semibold tabular-nums text-neutral-800">{formatTime(a.at)} IST</p>
    {a.action === "CLAIM" && a.revertedAt && (
      <p className="mt-0.5 text-sm font-medium tabular-nums text-neutral-600">Reverted {formatTime(a.revertedAt)} IST</p>
    )}

    {a.notes.length > 0 && (
      <ul className="mt-3 space-y-1.5">
        {a.notes.map((n) => {
          const style = NOTE_STYLES[n.kind] || NOTE_STYLES.NOTE;
          return (
            <li key={n.id} className={`rounded-lg border px-3 py-2 text-sm ${style.className}`}>
              <span className="font-bold">{style.label}:</span> <span className="break-words">{n.note}</span>
              <span className="block text-xs opacity-70">{formatTime(n.createdAt)} IST</span>
            </li>
          );
        })}
      </ul>
    )}

    <div className="mt-3 flex gap-2">
      <button type="button" onClick={() => onNote(a)} className="min-h-10 flex-1 rounded-lg border border-neutral-300 text-sm font-semibold text-neutral-800 active:bg-neutral-100">
        Add note
      </button>
      {a.canRevert && (
        <button type="button" onClick={() => onRevert(a)} className="min-h-10 flex-1 rounded-lg border border-red-300 text-sm font-semibold text-red-700 active:bg-red-50">
          Revert
        </button>
      )}
    </div>
  </article>
);

const StaffActivityPanel = ({ passcode, member, onClose, onUnauthorized }) => {
  const [category, setCategory] = useState("");
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // `search` once typing pauses
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reverting, setReverting] = useState(null);
  const [noting, setNoting] = useState(null);
  const requestId = useRef(0);
  const listRef = useRef(null);

  const fetchPage = useCallback(async (nextPage) => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");

    try {
      const result = await getStaffActivity(passcode, member.irisId, { category, action, q, page: nextPage });
      if (id !== requestId.current) return; // a newer filter change won
      setItems((prev) => (nextPage === 1 ? result.activity : [...prev, ...result.activity]));
      setTotal(result.total);
      setPage(nextPage);
    } catch (e) {
      if (id !== requestId.current) return;
      if (e.status === 401) onUnauthorized();
      setError(e.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [passcode, member.irisId, category, action, q, onUnauthorized]);

  // A new search or filter starts again from the top of the list
  useEffect(() => {
    setItems([]);
    listRef.current?.scrollTo(0, 0);
    fetchPage(1);
  }, [fetchPage]);

  // Search once typing pauses, not on every key
  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Close on Escape, and keep the page behind from scrolling while the panel is open
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !reverting && !noting && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, reverting, noting]);

  // A pass can appear twice (its claim and its revert), so update every card for it
  const updatePass = (passId, change) => setItems((prev) => prev.map((a) => (a.passId === passId ? change(a) : a)));

  const doRevert = async (reason) => {
    const item = reverting;
    try {
      await revertClaim(passcode, item.passId, reason);
    } catch (e) {
      if (e.status === 401) onUnauthorized();
      throw e;
    }
    const now = new Date().toISOString();
    updatePass(item.passId, (a) => ({
      ...a,
      passStatus: "ISSUED",
      canRevert: false,
      revertedAt: a.action === "CLAIM" && a.eventId === item.eventId ? now : a.revertedAt,
      notes: reason ? [...a.notes, { id: `local-${now}`, kind: "REVERT_REASON", note: reason, createdAt: now }] : a.notes,
    }));
    setReverting(null);
  };

  const doNote = async ({ note, kind }) => {
    const item = noting;
    let saved;
    try {
      saved = await addPassNote(passcode, item.passId, { note, kind });
    } catch (e) {
      if (e.status === 401) onUnauthorized();
      throw e;
    }
    updatePass(item.passId, (a) => ({ ...a, notes: [...a.notes, saved] }));
    setNoting(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      <div className="absolute inset-0 hidden bg-black/40 sm:block" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Activity of ${member.name || member.irisId}`}
        className="relative flex h-full w-full flex-col bg-[#f5f5f7] shadow-2xl sm:max-w-lg"
      >
        <header className="border-b border-neutral-200 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-neutral-900">{member.name || "No name"}</h2>
              <p className="text-sm text-neutral-500">
                {member.irisId} · {member.role === "ADMIN" ? "Admin" : "Volunteer"}{member.active ? "" : " · inactive"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-2xl leading-none text-neutral-700 active:bg-neutral-100"
            >
              ×
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[["Food", member.foodClaims], ["Merch", member.merchClaims], ["Reverts", member.reverts]].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-neutral-100 py-1.5">
                <div className="text-lg font-bold tabular-nums text-neutral-900">{value}</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength={60}
                enterKeyHint="search"
                placeholder="Search student name or IRIS ID"
                aria-label="Search student name or IRIS ID"
                className="min-h-11 w-full rounded-lg border border-neutral-300 bg-white py-2 pl-3 pr-11 text-base outline-none focus:ring-2 focus:ring-neutral-400 placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-xl leading-none text-neutral-500 active:bg-neutral-100"
                >
                  ×
                </button>
              )}
            </div>
            <Segmented label="Category" options={CATEGORY_FILTERS} value={category} onChange={setCategory} />
            <Segmented label="Action" options={ACTION_FILTERS} value={action} onChange={setAction} />
          </div>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!loading || items.length ? (
            <p className="text-sm text-neutral-500">{total} {total === 1 ? "entry" : "entries"} · newest first · times in IST</p>
          ) : null}

          {items.map((a) => (
            <ActivityCard key={a.eventId} a={a} onRevert={setReverting} onNote={setNoting} />
          ))}

          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="py-10 text-center text-neutral-400">{q ? `No one matching “${q}”.` : "Nothing here yet."}</p>
          )}

          {loading && <p className="py-4 text-center text-sm text-neutral-500">Loading…</p>}

          {!loading && items.length < total && (
            <button
              type="button"
              onClick={() => fetchPage(page + 1)}
              className="min-h-11 w-full rounded-lg border border-neutral-300 bg-white font-semibold text-neutral-800 active:bg-neutral-100"
            >
              Load more ({total - items.length} left)
            </button>
          )}
        </div>
      </aside>

      {reverting && <RevertDialog item={reverting} onCancel={() => setReverting(null)} onDone={doRevert} />}
      {noting && <NoteDialog item={noting} onCancel={() => setNoting(null)} onDone={doNote} />}
    </div>
  );
};

export default StaffActivityPanel;
