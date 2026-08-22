import { notFound } from '../../utils/apiError.js';
import { ensureObjectId } from '../../utils/ids.js';
import { writeAdminAudit } from '../../services/audit.service.js';
import { adminUsersRepository } from './adminUsers.repository.js';

export const adminUsersService = {
  async list(query: Record<string, unknown>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const filter: Record<string, unknown> = {};
    if (typeof query.search === 'string' && query.search.trim()) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: new RegExp(escaped, 'i') }, { email: new RegExp(escaped, 'i') }, { phone: new RegExp(escaped, 'i') }];
    }
    if (typeof query.verified === 'boolean') filter.isVerified = query.verified;
    else if (query.verified === 'true' || query.verified === 'false') filter.isVerified = query.verified === 'true';
    const [items, total] = await adminUsersRepository.list(filter, page, limit);
    return { items, total, page, limit };
  },
  async setStatus(id: string, isActive: boolean, adminId: string) {
    const user = await adminUsersRepository.updateStatus(ensureObjectId(id, 'user').toString(), isActive);
    if (!user) throw notFound('User');
    await writeAdminAudit(adminId, 'user.status', 'user', user.id, { isActive });
    return user;
  },
};
