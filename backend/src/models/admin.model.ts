import { Schema, model, type InferSchemaType } from 'mongoose';

const adminSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'sub-admin'], default: 'sub-admin' },
  isActive: { type: Boolean, default: true },
  authVersion: { type: Number, default: 0 },
  refreshSessionId: { type: String, select: false },
  lastLoginAt: Date,
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_document, returned) => {
      delete returned.passwordHash;
      delete returned.authVersion;
      delete returned.refreshSessionId;
      return returned;
    },
  },
});

export type AdminShape = InferSchemaType<typeof adminSchema>;
export const Admin = model('Admin', adminSchema);
