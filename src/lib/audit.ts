import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "SIGN" | "APPROVE" | "LOGIN" | "LOGOUT";

export type AuditEntity =
  | "Cliente"
  | "Produto"
  | "Lote"
  | "Amostra"
  | "Resultado"
  | "NaoConformidade"
  | "Laudo"
  | "Equipamento"
  | "PontoColeta"
  | "User"
  | "Fornecedor"
  | "Insumo"
  | "LoteInsumo"
  | "ConsumoInsumo"
  | "Embalagem"
  | "RegistroCIP"
  | "ConfiguracaoLaboratorio"
  | "Auditoria"
  | "ItemAuditoria"
  | "CartaControle"
  | "PCC"
  | "MonitoramentoPCC"
  | "Documento"
  | "Colaborador"
  | "Treinamento";

/**
 * Registra ação na trilha de auditoria (compliance MAPA / ISO 17025).
 * Nunca lança — falhas de auditoria são logadas mas não bloqueiam a operação.
 */
export async function auditLog(params: {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  diff?: unknown;
}) {
  try {
    const user = await getCurrentUser();
    const h = await headers();
    const ipAddress =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
    const userAgent = h.get("user-agent") ?? null;

    await prisma.auditLog.create({
      data: {
        userId: user?.id ?? null,
        userName: user?.name ?? user?.email ?? null,
        userRole: user?.role ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        diff: params.diff !== undefined ? JSON.stringify(params.diff) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write log:", err);
  }
}
