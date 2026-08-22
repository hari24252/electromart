import { Schema, model } from 'mongoose';

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtAdd: { type: Number, required: true, min: 0 },
}, { _id: true });

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: { type: [cartItemSchema], default: [] },
}, { timestamps: true, versionKey: false });

export const Cart = model('Cart', cartSchema);
