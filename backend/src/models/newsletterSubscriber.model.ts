import { Schema, model } from 'mongoose';

const newsletterSubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  source: { type: String, required: true, default: 'storefront-footer', maxlength: 80 },
  consentAt: { type: Date, required: true, default: Date.now },
  isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true, versionKey: false });

export const NewsletterSubscriber = model('NewsletterSubscriber', newsletterSubscriberSchema);
