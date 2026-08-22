import { writeAdminAudit } from '../../services/audit.service.js';
import { adminSettingsRepository } from './adminSettings.repository.js';

const defaults = {
  storeName: 'ElectroMart',
  supportEmail: 'support@electromart.com',
  supportPhone: '1800-123-4567',
  lowStockThreshold: 10,
  freeShippingMin: 999,
  notifications: { newOrders: true, lowStock: true, newUsers: false, reviews: true },
};

export const adminSettingsService = {
  async read() {
    return (await adminSettingsRepository.find()) ?? defaults;
  },
  async update(input: Record<string, unknown>, adminId: string) {
    const settings = await adminSettingsRepository.save(input);
    await writeAdminAudit(adminId, 'settings.update', 'store-settings', settings.id, input);
    return settings;
  },
};
