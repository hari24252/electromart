import { Schema, model, type InferSchemaType } from 'mongoose';

const specificationSchema = new Schema({
  group: { type: String, required: true, trim: true, maxlength: 80 },
  key: { type: String, required: true, trim: true, maxlength: 100 },
  value: { type: String, required: true, trim: true, maxlength: 500 },
}, { _id: false });

const warrantySchema = new Schema({
  duration: { type: String, trim: true, maxlength: 80 },
  type: { type: String, trim: true, maxlength: 80 },
  details: { type: String, trim: true, maxlength: 1000 },
}, { _id: false });

const productSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  brand: { type: String, required: true, trim: true, maxlength: 80, index: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 80 },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  subCategories: { type: [{ type: Schema.Types.ObjectId, ref: 'Category' }], default: [] },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: { type: [String], default: [] },
  thumbnail: { type: String, trim: true },
  shortDescription: { type: String, required: true, trim: true, maxlength: 500 },
  longDescription: { type: String, required: true, trim: true, maxlength: 20000 },
  specifications: { type: [specificationSchema], default: [] },
  whatsInTheBox: { type: [String], default: [] },
  warranty: { type: warrantySchema, default: {} },
  termsAndConditions: { type: String, trim: true, maxlength: 10000 },
  status: { type: String, enum: ['active', 'draft', 'out-of-stock', 'archived'], default: 'draft', index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  ratingsAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingsCount: { type: Number, default: 0, min: 0 },
  soldCount: { type: Number, default: 0, min: 0 },
  deletedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false, toJSON: { virtuals: true } });

productSchema.index({ name: 'text', brand: 'text', shortDescription: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ deletedAt: 1, status: 1, createdAt: -1 });

export type ProductShape = InferSchemaType<typeof productSchema>;
export const Product = model('Product', productSchema);
