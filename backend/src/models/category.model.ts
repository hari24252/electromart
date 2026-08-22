import { Schema, model, type InferSchemaType } from 'mongoose';

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  image: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });

categorySchema.index({ parentCategory: 1, sortOrder: 1, name: 1 });
export type CategoryShape = InferSchemaType<typeof categorySchema>;
export const Category = model('Category', categorySchema);
