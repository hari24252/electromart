import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  action: { type: String, required: true, trim: true },
  entityType: { type: String, required: true, trim: true },
  entityId: { type: String, required: true, trim: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true, versionKey: false });

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
export const AuditLog = model('AuditLog', auditLogSchema);
