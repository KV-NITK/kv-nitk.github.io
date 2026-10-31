import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, RefreshCw, ShieldAlert } from "lucide-react";
import { ScannerConsole, staffRequest } from "@p26/scan/Scanner";

const STORAGE_KEY = "parva_booth_passcode";
const MODES = [{ key: "PHOTO", label: "Photo" }];

const loadPasscode = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const savePasscode = (value) => {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode: the password is asked for again next time
  }
};

// The photo booth's scanner (/parva-26/photobooth/scan), for the person running
// the booth, who has no IRIS login. The booth password (PHOTO_BOOTH_PASSCODE)
// opens it and is kept on this phone until Logout. It is the festival scanner
// fixed to photo sessions: the server only lets it claim photo booth passes,
// each scan says how many prints to hand over, and it cannot revert a claim.
export default function BoothScanner() {
  const [passcode, setPasscode] = useState(loadPasscode);
  const [access, setAccess] = useState(passcode ? "checking" : "locked"); // locked | checking | ready | off | error
  const [staff, setStaff] = useState(null);
  const [message, setMessage] = useState("");

  const check = useCallback(async (code) => {
    setAccess("checking");
    setMessage("");

    try {
      const { status, data } = await staffRequest("/booth/me", { headers: { "x-booth-passcode": code } });

      if (status === 200 && data.staff) {
        savePasscode(code);
        setPasscode(code);
        setStaff(data.staff);
        setAccess(data.staff.active ? "ready" : "off");
        return;
      }

      if (status === 401 || status === 429) {
        savePasscode("");
        setPasscode("");
        setAccess("locked");
        setMessage(status === 401 ? "Wrong password. Try again." : data.message || "Too many tries. Wait a few minutes.");
        return;
      }

      setAccess("error");
      setMessage(data.message || "The scanner could not start.");
    } catch (error) {
      setAccess("error");
      setMessage(error?.timeout ? "The server did not answer." : "Could not reach the server.");
    }
  }, []);

  useEffect(() => {
    if (passcode) void check(passcode);
    // Only the password found on this phone, once
  }, []);

  const lock = useCallback((text = "") => {
    savePasscode("");
    setPasscode("");
    setStaff(null);
    setAccess("locked");
    setMessage(text);
  }, []);

  const api = useMemo(() => {
    const headers = { "x-booth-passcode": passcode };

    return {
      scan: (token) => staffRequest("/booth/scan", { method: "POST", body: { token }, headers }),
      search: (q) => staffRequest(`/booth/search?q=${encodeURIComponent(q)}`, { headers }),
      // The console never gets here: only an admin may revert, and the booth is not one
      revert: async () => ({ status: 403, data: { message: "The photo booth cannot revert a claim." } }),
    };
  }, [passcode]);

  if (access === "ready") {
    return (
      <ScannerConsole
        staff={staff}
        api={api}
        modes={MODES}
        onLoggedOut={() => lock("The password has changed. Enter the new one.")}
        onLogout={() => lock()}
      />
    );
  }

  return <PasswordScreen access={access} message={message} onSubmit={check} onRetry={() => check(passcode)} onLock={() => lock()} />;
}

function PasswordScreen({ access, message, onSubmit, onRetry, onLock }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0b0705] px-6 text-center font-sans text-[#f5ebd9]">
      {/* The Kannada flag over the camera: yellow, then red */}
      <div className="mb-4 grid size-16 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(#f2c12e_50%,#c8102e_50%)] shadow-[0_0.5rem_1rem_rgba(0,0,0,.5)]">
        <Camera className="size-8 text-[#2b0a0e]" />
      </div>
      <h1 className="text-xl font-bold text-[#f7b928]">ಫೋಟೋ ಬೂತ್ ಸ್ಕ್ಯಾನರ್ · Photo Booth Scanner</h1>
      <p className="mt-2 max-w-xs text-sm text-[#c7aa88]">
        Scan the QR code on the visitor's phone. Each code is one photo session and shows how many prints to give.
      </p>

      {access === "checking" && (
        <div className="mt-6 flex items-center gap-2 text-sm text-[#c7aa88]">
          <RefreshCw className="size-4 animate-spin" /> Checking…
        </div>
      )}

      {access === "locked" && (
        <form
          className="mt-6 flex w-full max-w-xs flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSubmit(value.trim());
          }}
        >
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Booth password"
            autoComplete="current-password"
            aria-label="Booth password"
            className="w-full rounded-md border border-[#4d2d1b] bg-[#1a0f0a] px-4 py-3 text-base text-white outline-none focus:border-[#f7b928]"
          />
          {message && (
            <p role="alert" className="rounded-md border border-red-600/50 bg-red-900/30 px-3 py-2 text-xs font-semibold text-red-200">
              {message}
            </p>
          )}
          <button type="submit" disabled={!value.trim()} className="w-full rounded-md bg-[#f7b928] px-4 py-3 text-sm font-bold text-black disabled:opacity-50">
            Start scanning
          </button>
        </form>
      )}

      {access === "off" && (
        <>
          <ShieldAlert className="mt-6 size-10 text-amber-400" />
          <p className="mt-2 max-w-xs text-sm text-amber-200">The photo booth scanner is switched off. Ask the festival team to turn it on.</p>
          <button type="button" onClick={onRetry} className="mt-6 flex items-center gap-2 rounded-md bg-[#f7b928] px-4 py-3 text-sm font-bold text-black">
            <RefreshCw className="size-4" /> Check again
          </button>
          <button type="button" onClick={onLock} className="mt-3 text-xs font-semibold text-[#c7aa88] underline">
            Use a different password
          </button>
        </>
      )}

      {access === "error" && (
        <>
          <p className="mt-4 max-w-xs text-sm text-red-200">{message} Check the connection and try again.</p>
          <button type="button" onClick={onRetry} className="mt-6 flex items-center gap-2 rounded-md bg-[#f7b928] px-4 py-3 text-sm font-bold text-black">
            <RefreshCw className="size-4" /> Retry
          </button>
        </>
      )}
    </div>
  );
}
