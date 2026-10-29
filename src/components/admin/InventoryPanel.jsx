import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addSpotSale, getInventory, saveStock, undoSpotSale } from "../../api/staffAdmin";
import { Sheet } from "./shared";

// Merch stock per fit and size. Full screen on a phone. Given = scanned + sold on
// the spot; Left = Stock − Given; Spare = Left − still to collect (paid online).

const REFRESH_MS = 20000;
const LOW_LEFT = 3;

const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

const withCounts = (row) => {
  const given = row.claimed + row.spot;
  const left = row.stock == null ? null : row.stock - given;
  return { ...row, given, left, spare: left == null ? null : left - row.toCollect };
};

// Sums a group; Stock, Left and Spare only when every row in it has a stock
const totalOf = (rows) => {
  const allStocked = rows.length > 0 && rows.every((r) => r.stock != null);
  const sum = (key) => rows.reduce((n, r) => n + (r[key] ?? 0), 0);
  return {
    stock: allStocked ? sum("stock") : null,
    given: sum("given"),
    spot: sum("spot"),
    left: allStocked ? sum("left") : null,
    toCollect: sum("toCollect"),
    spare: allStocked ? sum("spare") : null,
  };
};

const show = (n) => (n == null ? "—" : n);

const leftClass = (left) => (left != null && left <= LOW_LEFT ? (left < 0 ? "text-red-700" : "text-amber-700") : "");
const spareClass = (spare) => (spare != null && spare < 0 ? "bg-red-50 font-semibold text-red-700" : "");

const COLS = ["Size", "Stock", "Given", "Left", "To collect", "Spare"];

const FitTable = ({ fit, rows, editing, draft, setDraft }) => {
  const total = totalOf(rows);

  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm">
      <h3 className="border-b border-neutral-100 px-3 py-2 text-base font-bold text-neutral-900">{fit}</h3>
      <table className="w-full table-fixed text-center text-sm tabular-nums">
        <thead className="text-[11px] font-bold uppercase leading-tight tracking-wide text-neutral-400">
          <tr>
            {COLS.map((c) => (
              <th key={c} className="px-1 py-1.5 font-bold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((r) => (
            <tr key={r.productId}>
              <td className="px-1 py-2 font-bold text-neutral-900">{r.size}</td>
              <td className="px-1 py-1">
                {editing ? (
                  <input
                    value={draft[r.productId] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [r.productId]: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    inputMode="numeric"
                    aria-label={`Stock of ${fit} ${r.size}`}
                    className="w-full rounded-md border border-neutral-300 px-1 py-1.5 text-center text-base outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                ) : (
                  show(r.stock)
                )}
              </td>
              <td className="px-1 py-2">
                {r.given}
                {r.spot > 0 && <span className="block text-[10px] leading-tight text-neutral-500">incl. {r.spot} spot</span>}
              </td>
              <td className={`px-1 py-2 font-semibold ${leftClass(r.left)}`}>{show(r.left)}</td>
              <td className="px-1 py-2">{r.toCollect}</td>
              <td className={`px-1 py-2 ${spareClass(r.spare)}`}>{r.spare != null && r.spare > 0 ? `+${r.spare}` : show(r.spare)}</td>
            </tr>
          ))}
          <tr className="bg-neutral-50 font-bold text-neutral-900">
            <td className="px-1 py-2 text-xs uppercase">Total</td>
            <td className="px-1 py-2">{show(total.stock)}</td>
            <td className="px-1 py-2">{total.given}</td>
            <td className={`px-1 py-2 ${total.left != null && total.left < 0 ? "text-red-700" : ""}`}>{show(total.left)}</td>
            <td className="px-1 py-2">{total.toCollect}</td>
            <td className={`px-1 py-2 ${spareClass(total.spare)}`}>{total.spare != null && total.spare > 0 ? `+${total.spare}` : show(total.spare)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

const Choice = ({ selected, onClick, children }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={`min-h-11 rounded-lg border px-3 text-base font-semibold transition-colors ${selected ? "border-black bg-black text-white" : "border-neutral-300 bg-white text-neutral-800"}`}
  >
    {children}
  </button>
);

const SpotSaleSheet = ({ rows, onCancel, onSave }) => {
  const fits = useMemo(() => [...new Set(rows.map((r) => r.fit))], [rows]);
  const [fit, setFit] = useState(fits.length === 1 ? fits[0] : "");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sizes = rows.filter((r) => r.fit === fit);
  const chosen = rows.find((r) => r.productId === productId);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onSave({ productId, quantity, studentName: name.trim() || undefined }, chosen);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <Sheet title="Spot sale" onClose={busy ? () => {} : onCancel}>
      <p className="mt-3 text-sm font-semibold text-neutral-700">Fit</p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {fits.map((f) => (
          <Choice
            key={f}
            selected={fit === f}
            onClick={() => {
              setFit(f);
              setProductId("");
            }}
          >
            {f}
          </Choice>
        ))}
      </div>

      <p className="mt-3 text-sm font-semibold text-neutral-700">Size</p>
      {fit ? (
        <div className="mt-1 grid grid-cols-3 gap-2">
          {sizes.map((r) => (
            <Choice key={r.productId} selected={productId === r.productId} onClick={() => setProductId(r.productId)}>
              {r.size}
            </Choice>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm text-neutral-400">Pick a fit first.</p>
      )}

      <p className="mt-3 text-sm font-semibold text-neutral-700">How many</p>
      <div className="mt-1 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="One less"
          className="flex size-11 items-center justify-center rounded-full border border-neutral-300 text-2xl font-bold disabled:opacity-40"
        >
          −
        </button>
        <span className="w-10 text-center text-2xl font-bold tabular-nums" aria-live="polite">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(100, q + 1))}
          aria-label="One more"
          className="flex size-11 items-center justify-center rounded-full border border-neutral-300 text-2xl font-bold"
        >
          +
        </button>
      </div>

      <label className="mt-3 block text-sm font-semibold text-neutral-700">
        Student name <span className="font-normal text-neutral-400">(optional)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Name"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </label>

      {chosen && chosen.left != null && (
        <p className={`mt-3 text-sm ${chosen.left - quantity < 0 ? "font-semibold text-red-700" : "text-neutral-600"}`}>
          {chosen.fit} · {chosen.size}: {chosen.left} left → {chosen.left - quantity} after this
          {chosen.left - quantity < 0 ? ". More than the stock says is left; check the stock." : ""}
        </p>
      )}
      {chosen && chosen.left == null && (
        <p className="mt-3 text-sm text-neutral-500">No stock entered for {chosen.fit} · {chosen.size} yet.</p>
      )}

      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 flex-1 rounded-lg border border-neutral-300 font-semibold disabled:opacity-60">
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={busy || !chosen} className="min-h-11 flex-[1.4] rounded-lg bg-black font-semibold text-white disabled:opacity-50">
          {busy ? "Saving…" : `Save ${quantity} shirt${quantity === 1 ? "" : "s"}`}
        </button>
      </div>
    </Sheet>
  );
};

const UndoSheet = ({ sale, onCancel, onConfirm }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <Sheet title="Undo this spot sale?" onClose={busy ? () => {} : onCancel}>
      <p className="mt-1 text-sm text-neutral-600">
        {sale.quantity} × {sale.fit} · {sale.size}{sale.studentName ? ` for ${sale.studentName}` : ""}, {formatTime(sale.createdAt)} IST.
        The {sale.quantity === 1 ? "shirt goes" : "shirts go"} back into Left.
      </p>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 flex-1 rounded-lg border border-neutral-300 font-semibold disabled:opacity-60">
          Keep it
        </button>
        <button type="button" onClick={confirm} disabled={busy} className="min-h-11 flex-1 rounded-lg bg-red-600 font-semibold text-white disabled:opacity-60">
          {busy ? "Undoing…" : "Undo sale"}
        </button>
      </div>
    </Sheet>
  );
};

const InventoryPanel = ({ passcode, onClose, onUnauthorized }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadedAt, setLoadedAt] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [selling, setSelling] = useState(false);
  const [undoing, setUndoing] = useState(null);
  const [notice, setNotice] = useState("");
  const busyRef = useRef(false); // a write is in progress: skip the background refresh

  const handle = useCallback((e) => {
    if (e.status === 401) onUnauthorized();
    throw e;
  }, [onUnauthorized]);

  const apply = (inventory) => {
    setData(inventory);
    setLoadedAt(new Date());
    setError("");
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const inventory = await getInventory(passcode);
      if (!busyRef.current) apply(inventory);
    } catch (e) {
      if (e.status === 401) onUnauthorized();
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [passcode, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the numbers fresh while it is open and nothing is being typed
  const paused = editing || selling || !!undoing;
  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [paused, load]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !paused && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, paused]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const rows = useMemo(() => (data?.rows || []).map(withCounts), [data]);
  const fits = useMemo(() => {
    const groups = new Map();
    for (const r of rows) groups.set(r.fit, [...(groups.get(r.fit) || []), r]);
    return [...groups.entries()];
  }, [rows]);
  const overall = useMemo(() => totalOf(rows), [rows]);

  const startEdit = () => {
    setDraft(Object.fromEntries(rows.map((r) => [r.productId, r.stock == null ? "" : String(r.stock)])));
    setSaveError("");
    setEditing(true);
  };

  const changed = rows.filter((r) => (draft[r.productId] ?? "") !== "" && Number(draft[r.productId]) !== r.stock);

  const save = async () => {
    if (!changed.length) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setSaveError("");
    busyRef.current = true;
    try {
      apply(await saveStock(passcode, changed.map((r) => ({ productId: r.productId, stock: Number(draft[r.productId]) }))).catch(handle));
      setEditing(false);
      setNotice(`Stock saved for ${changed.length} ${changed.length === 1 ? "size" : "sizes"}.`);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  };

  const sell = async (sale, chosen) => {
    busyRef.current = true;
    try {
      apply(await addSpotSale(passcode, sale).catch(handle));
    } finally {
      busyRef.current = false;
    }
    setSelling(false);
    setNotice(`Saved: ${sale.quantity} × ${chosen.fit} · ${chosen.size}.`);
  };

  const undo = async () => {
    const sale = undoing;
    busyRef.current = true;
    try {
      apply(await undoSpotSale(passcode, sale.id).catch(handle));
    } finally {
      busyRef.current = false;
    }
    setUndoing(null);
    setNotice(`Undone: ${sale.quantity} × ${sale.fit} · ${sale.size}.`);
  };

  const spotSales = data?.spotSales || [];
  const spotTotal = spotSales.reduce((n, s) => n + s.quantity, 0);
  const unmatched = data?.unmatched;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      <div className="absolute inset-0 hidden bg-black/40 sm:block" onClick={paused ? undefined : onClose} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-label="Merch inventory" className="relative flex h-full w-full flex-col bg-[#f5f5f7] shadow-2xl sm:max-w-xl">
        <header className="border-b border-neutral-200 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-neutral-900">Merch inventory</h2>
              <p className="text-xs text-neutral-500">
                {loading && !data ? "Loading…" : loadedAt ? `Updated ${loadedAt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", second: "2-digit" })} IST · refreshes every 20 s` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={editing}
              aria-label="Close"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-2xl leading-none text-neutral-700 active:bg-neutral-100 disabled:opacity-40"
            >
              ×
            </button>
          </div>
          {data && !editing && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setSelling(true)} className="min-h-11 rounded-lg bg-black text-sm font-semibold text-white active:bg-neutral-800">
                + Spot sale
              </button>
              <button type="button" onClick={startEdit} className="min-h-11 rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-800 active:bg-neutral-100">
                Edit stock
              </button>
              <button type="button" onClick={load} disabled={loading} className="min-h-11 rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-800 active:bg-neutral-100 disabled:opacity-60">
                {loading ? "…" : "Refresh"}
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {notice && (
            <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">{notice}</p>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {data ? `Could not refresh: ${error}` : error}
            </p>
          )}

          {data && (
            <>
              {!editing && (
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[["Stock", overall.stock], ["Given", overall.given], ["Left", overall.left], ["Spare", overall.spare]].map(([label, value]) => (
                    <div key={label} className={`rounded-lg bg-white py-2 shadow-sm ${label === "Spare" ? spareClass(value) : ""}`}>
                      <div className="text-lg font-bold tabular-nums">{label === "Spare" && value > 0 ? `+${value}` : show(value)}</div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {editing && (
                <p className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700">
                  Enter the total shirts you started with for each size. Given and Left update from these.
                </p>
              )}

              {fits.map(([fit, fitRows]) => (
                <FitTable key={fit} fit={fit} rows={fitRows} editing={editing} draft={draft} setDraft={setDraft} />
              ))}

              {unmatched && (unmatched.claimed > 0 || unmatched.toCollect > 0) && (
                <p className="text-xs text-neutral-500">
                  Also {unmatched.claimed} given and {unmatched.toCollect} to collect whose size could not be worked out; they are not in the table.
                </p>
              )}

              {!editing && (
                <p className="text-xs text-neutral-500">
                  Given = scanned + spot sales. Left = Stock − Given. Spare = Left − To collect (paid online, not picked up). Red Spare means more people are owed that size than there are shirts.
                </p>
              )}

              {!editing && (
                <section>
                  <h3 className="text-base font-bold text-neutral-900">
                    Spot sales <span className="font-normal text-neutral-500">({spotTotal} {spotTotal === 1 ? "shirt" : "shirts"})</span>
                  </h3>
                  {spotSales.length === 0 ? (
                    <p className="mt-2 text-sm text-neutral-400">None yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {spotSales.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 shadow-sm">
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900">{s.quantity} × {s.fit} · {s.size}</p>
                            <p className="truncate text-sm text-neutral-600">{s.studentName || <span className="text-neutral-400">No name</span>}</p>
                            <p className="text-xs text-neutral-500">{formatTime(s.createdAt)} IST</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUndoing(s)}
                            className="min-h-10 shrink-0 rounded-lg border border-red-300 px-3 text-sm font-semibold text-red-700 active:bg-red-50"
                          >
                            Undo
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        {editing && (
          <footer className="border-t border-neutral-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {saveError && <p role="alert" className="mb-2 text-sm font-semibold text-red-700">{saveError}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(false)} disabled={saving} className="min-h-11 flex-1 rounded-lg border border-neutral-300 font-semibold disabled:opacity-60">
                Cancel
              </button>
              <button type="button" onClick={save} disabled={saving} className="min-h-11 flex-[1.4] rounded-lg bg-black font-semibold text-white disabled:opacity-60">
                {saving ? "Saving…" : changed.length ? `Save ${changed.length} ${changed.length === 1 ? "change" : "changes"}` : "Done"}
              </button>
            </div>
          </footer>
        )}
      </aside>

      {selling && <SpotSaleSheet rows={rows} onCancel={() => setSelling(false)} onSave={sell} />}
      {undoing && <UndoSheet sale={undoing} onCancel={() => setUndoing(null)} onConfirm={undo} />}
    </div>
  );
};

export default InventoryPanel;
