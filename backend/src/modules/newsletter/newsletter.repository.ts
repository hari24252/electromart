import { NewsletterSubscriber } from '../../models/newsletterSubscriber.model.js';

export const newsletterRepository = {
  subscribe: (email: string) => NewsletterSubscriber.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { isActive: true, consentAt: new Date(), source: 'storefront-footer' } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  ),
};
