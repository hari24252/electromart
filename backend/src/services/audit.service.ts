import { AuditLog } from '../models/auditLog.model.js';

export async function writeAdminAudit(
  actor: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await AuditLog.create({ actor, action, entityType, entityId, ...(metadata ? { metadata } : {}) });
}
