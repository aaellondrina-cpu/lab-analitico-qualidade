import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    // "LAB" para User interno do laboratório; "CLIENT" para ClienteUser do portal.
    type?: "LAB" | "CLIENT";
    clienteId?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      type: "LAB" | "CLIENT";
      clienteId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    type?: "LAB" | "CLIENT";
    clienteId?: string;
  }
}
