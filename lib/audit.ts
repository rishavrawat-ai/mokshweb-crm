import { db } from "@/lib/db"

export async function createAuditLog(
    actorUserId: number | undefined | null,
    action: string,
    entityType: string,
    entityId: string,
    meta: any = {}
) {
    try {
        await db.auditLog.create({
            data: {
                actorUserId: actorUserId || null,
                action,
                entityType,
                entityId,
                metaJson: JSON.stringify(meta)
            }
        })
    } catch (error) {
        console.error("AUDIT_LOG_ERROR", error)
    }
}
