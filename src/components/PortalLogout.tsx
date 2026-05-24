"use client";

import { signOut } from "next-auth/react";

export function PortalLogout() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/portal/login" })}
      className="text-sm text-slate-500 hover:text-red-600"
    >
      Sair
    </button>
  );
}
