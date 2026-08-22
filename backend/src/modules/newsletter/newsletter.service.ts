import { newsletterRepository } from './newsletter.repository.js';

export const newsletterService = {
  async subscribe(email: string) {
    const subscriber = await newsletterRepository.subscribe(email);
    return { email: subscriber.email };
  },
};
