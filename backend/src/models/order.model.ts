import { Schema, model } from 'mongoose';

const addressSnapshotSchema = new Schema({
  recipientName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
}, { _id: false });

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  sku: { type: String, required: true },
  image: String,
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const statusHistorySchema = new Schema({
  status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], required: true },
  note: { type: String, trim: true, maxlength: 500 },
  changedBy: { type: String, enum: ['user', 'admin', 'system'], required: true },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], required: true, validate: [(items: unknown[]) => items.length > 0, 'Order must contain items'] },
  shippingAddress: { type: addressSnapshotSchema, required: true },
  status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'placed', index: true },
  statusHistory: { type: [statusHistorySchema], default: [] },
  paymentMethod: { type: String, enum: ['COD'], default: 'COD', immutable: true },
  coupon: { code: String, discount: Number },
  itemsTotal: { type: Number, required: true, min: 0 },
  discountTotal: { type: Number, default: 0, min: 0 },
  shippingTotal: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  cancelledAt: Date,
}, { timestamps: true, versionKey: false });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
export const Order = model('Order', orderSchema);
