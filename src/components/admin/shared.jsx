import React, { useCallback, useEffect, useState } from "react";

// Shared by the admin pages: the password kept in sessionStorage under `passKey`,
// and the data `fetchData(passcode)` returns. Only a 401 (wrong password) drops the
// data and shows the password screen again; any other failed refresh keeps the
// page and leaves the message in `error`.

const readPass = (key) => {
  try {
    return sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

const writePass = (key, value) => {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const usePasscodeData = (passKey, fetchData) => {
  const [passcode, setPasscode] = useState(() => readPass(passKey));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lock = useCallback(() => {
    writePass(passKey, "");
    setPasscode("");
    setData(null);
    setError("");
  }, [passKey]);

  const load = useCallback(async (pass) => {
    setLoading(true);
    setError("");

    try {
      setData(await fetchData(pass));
      setPasscode(pass);
      writePass(passKey, pass);
    } catch (e) {
      if (e.status === 401) lock();
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [passKey, fetchData, lock]);

  useEffect(() => {
    if (passcode) load(passcode);
  }, []);

  return { passcode, data, setData, loading, error, load, lock };
};

export const PasswordGate = ({ title, prompt, submitLabel, loading, error, onSubmit }) => {
  const [passInput, setPassInput] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4 font-sans">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (passInput.trim()) onSubmit(passInput.trim());
        }}
        className="w-full max-w-sm rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-600">{prompt}</p>
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
          {loading ? "Checking…" : submitLabel}
        </button>
      </form>
    </div>
  );
};

// A failed refresh, shown above the page that is still on screen
export const RefreshError = ({ error }) =>
  error ? (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
      Could not refresh: {error}
    </p>
  ) : null;

export const StatCard = ({ label, value }) => (
  <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
    <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</div>
    <div className="mt-1.5 text-3xl font-bold text-neutral-900">{value}</div>
  </div>
);
