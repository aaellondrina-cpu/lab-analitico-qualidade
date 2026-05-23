import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const ROLES = ["LEITURA", "ANALISTA", "RESPONSAVEL_TECNICO", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(min: Role) {
  const user = await requireUser();
  const userIdx = ROLES.indexOf((user.role ?? "LEITURA") as Role);
  const minIdx = ROLES.indexOf(min);
  if (userIdx < minIdx) redirect("/dashboard");
  return user;
}

export function canWrite(role?: string | null) {
  return role === "ADMIN" || role === "RESPONSAVEL_TECNICO" || role === "ANALISTA";
}
