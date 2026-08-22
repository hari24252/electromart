import { Schema, model } from 'mongoose';

const inventoryLogSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  change: { type: Number, required: true },
  previousStock: { type: Number, required: true, min: 0 },
  resultingStock: { type: Number, required: true, min: 0 },
  reason: { type: String, enum: ['restock', 'correction', 'order', 'cancellation'], required: true },
  reference: { type: String, trim: true },
  actor: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true, versionKey: false });

inventoryLogSchema.index({ product: 1, createdAt: -1 });
export const InventoryLog = model('InventoryLog', inventoryLogSchema);
