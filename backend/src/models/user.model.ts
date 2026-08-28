import { Schema, model, type InferSchemaType } from 'mongoose';

const addressSchema = new Schema({
  label: { type: String, trim: true, maxlength: 40, default: 'Home' },
  recipientName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, match: /^[0-9+\-() ]{7,20}$/ },
  line1: { type: String, required: true, trim: true, maxlength: 150 },
  line2: { type: String, trim: true, maxlength: 150 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  state: { type: String, required: true, trim: true, maxlength: 80 },
  postalCode: { type: String, required: true, trim: true, maxlength: 20 },
  country: { type: String, required: true, trim: true, maxlength: 80, default: 'India' },
  isDefault: { type: Boolean, default: false },
}, { _id: true, timestamps: true });

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, unique: true, sparse: true, match: /^\S+@\S+\.\S+$/ },
  phone: { type: String, trim: true, unique: true, sparse: true, match: /^[0-9+\-() ]{7,20}$/ },
  passwordHash: { type: String, required: true, select: false },
  // Accounts are authenticated with their password at signup; no verification challenge is required.
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  authVersion: { type: Number, default: 0 },
  refreshSessionId: { type: String, select: false },
  addresses: { type: [addressSchema], default: [] },
  wishlist: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
  lastLoginAt: { type: Date },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_document, returned) => {
      delete returned.passwordHash;
      delete returned.authVersion;
      delete returned.refreshSessionId;
      return returned;
    },
  },
});

userSchema.pre('validate', function validateContact() {
  if (!this.email && !this.phone) this.invalidate('email', 'Either email or phone is required');
});

export type UserShape = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
