import { conflict, forbidden, notFound } from '../../utils/apiError.js';
import { ensureObjectId } from '../../utils/ids.js';
import { productRepository } from '../product/product.repository.js';
import { productService } from '../product/product.service.js';
import { orderService } from '../order/order.service.js';
import { writeAdminAudit } from '../../services/audit.service.js';
import { reviewRepository } from './review.repository.js';

async function updateAggregate(productId: string): Promise<void> {
  const aggregate = await reviewRepository.aggregateRatings(productId);
  await productService.updateRatingAggregate(productId, Number(aggregate.average.toFixed(2)), aggregate.count);
}

export const reviewService = {
  async list(productId: string) { return reviewRepository.findByProduct(ensureObjectId(productId, 'product').toString()); },
  async create(userId: string, productIdInput: string, input: Record<string, unknown>) {
    const productId = ensureObjectId(productIdInput, 'product').toString();
    if (!await productRepository.findById(productId)) throw notFound('Product');
    if (await reviewRepository.findByProductAndUser(productId, userId)) throw conflict('You have already reviewed this product', 'DUPLICATE_REVIEW');
    const isVerifiedPurchase = await orderService.hasDeliveredProduct(userId, productId);
    const review = await reviewRepository.create({ ...input, product: productId, user: userId, isVerifiedPurchase });
    await updateAggregate(productId);
    return review;
  },
  async update(userId: string, idInput: string, input: Record<string, unknown>) {
    const id = ensureObjectId(idInput, 'review').toString();
    const review = await reviewRepository.findById(id);
    if (!review) throw notFound('Review');
    if (review.user.toString() !== userId) throw forbidden('You can only edit your own review');
    const updated = await reviewRepository.update(id, input);
    if (!updated) throw notFound('Review');
    await updateAggregate(review.product.toString());
    return updated;
  },
  async remove(idInput: string, userId?: string, adminId?: string) {
    const id = ensureObjectId(idInput, 'review').toString();
    const review = await reviewRepository.findById(id);
    if (!review) throw notFound('Review');
    if (!adminId && review.user.toString() !== userId) throw forbidden('You can only delete your own review');
    await reviewRepository.remove(id);
    await updateAggregate(review.product.toString());
    if (adminId) await writeAdminAudit(adminId, 'review.delete', 'review', id, { productId: review.product.toString() });
  },
  async moderate(adminId: string, idInput: string, isApproved: boolean) {
    const id = ensureObjectId(idInput, 'review').toString();
    const review = await reviewRepository.update(id, { isApproved });
    if (!review) throw notFound('Review');
    await updateAggregate(review.product.toString());
    await writeAdminAudit(adminId, 'review.moderate', 'review', id, { isApproved });
    return review;
  },
};
