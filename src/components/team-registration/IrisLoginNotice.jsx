import React from "react";
import { Revolver } from "../HH2026/roaming-assets";

export function IrisLoginNotice({
  handleIrisLogin,
  message = "Login with your NITK IRIS account to claim your squad's spot in the hunt.",
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <Revolver className="w-32" />

      <p className="max-w-md font-serif text-lg font-semibold leading-relaxed text-[#3d1e0b]">
        {message}
      </p>

      <button
        type="button"
        onClick={handleIrisLogin}
        className="border-2 border-[#4a2206] bg-[#8b261b] hover:bg-[#6e1e15] text-[#f7eed6] px-9 py-4 font-serif text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-lg shadow-[#8b261b]/30 cursor-pointer"
      >
        Login with IRIS
      </button>
    </div>
  );
}
