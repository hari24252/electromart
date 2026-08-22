import { Schema, model, type InferSchemaType } from 'mongoose';

const notificationsSchema = new Schema({
  newOrders: { type: Boolean, default: true },
  lowStock: { type: Boolean, default: true },
  newUsers: { type: Boolean, default: false },
  reviews: { type: Boolean, default: true },
}, { _id: false });

const storeSettingsSchema = new Schema({
  key: { type: String, required: true, unique: true, default: 'default' },
  storeName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100, default: 'ElectroMart' },
  supportEmail: { type: String, required: true, trim: true, lowercase: true, default: 'support@electromart.com' },
  supportPhone: { type: String, required: true, trim: true, maxlength: 30, default: '1800-123-4567' },
  lowStockThreshold: { type: Number, required: true, min: 0, max: 10_000, default: 10 },
  freeShippingMin: { type: Number, required: true, min: 0, max: 1_000_000, default: 999 },
  notifications: { type: notificationsSchema, default: () => ({}) },
}, { timestamps: true, versionKey: false });

export type StoreSettingsShape = InferSchemaType<typeof storeSettingsSchema>;
export const StoreSettings = model('StoreSettings', storeSettingsSchema);
