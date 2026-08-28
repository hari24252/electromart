import { useEffect, useState } from 'react';
import { ThumbsUp, BadgeCheck, Star, PenLine, Pencil, Trash2 } from 'lucide-react';
import type { Review } from '@/types';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  ratingsAvg: number;
  ratingsCount: number;
}

export function ReviewSection({ productId, reviews, ratingsAvg, ratingsCount }: ReviewSectionProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [helpful, setHelpful] = useState<Set<string>>(new Set());
  const [localReviews, setLocalReviews] = useState(reviews);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = localReviews.filter((review) => review.rating === star).length;
    const percent = localReviews.length > 0 ? (count / localReviews.length) * 100 : 0;
    return { star, count, percent };
  });

  const toggleHelpful = (id: string) => {
    setHelpful((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast('warning', 'Please add a short review before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { rating, ...(title.trim() ? { title: title.trim() } : {}), comment: comment.trim() };
      const review = editingReview
        ? await api.reviews.update(editingReview._id, payload)
        : await api.reviews.create(productId, payload);
      setLocalReviews((current) => editingReview
        ? current.map((item) => item._id === review._id ? review : item)
        : [review, ...current.filter((item) => item._id !== review._id)]);
      setIsWriting(false);
      setEditingReview(null);
      setTitle('');
      setComment('');
      setRating(5);
      toast('success', editingReview ? 'Your review was updated.' : 'Your review was submitted for moderation.');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setTitle(review.title ?? '');
    setComment(review.comment);
    setIsWriting(true);
  };

  const deleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await api.reviews.remove(reviewToDelete._id);
      setLocalReviews((current) => current.filter((review) => review._id !== reviewToDelete._id));
      toast('success', 'Your review was deleted.');
    } catch (error) {
      toast('error', getApiErrorMessage(error), 'Could not delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold uppercase tracking-tight">Customer Reviews</h3>
        {isAuthenticated && (
          <Button size="sm" onClick={() => setIsWriting(true)}>
            <PenLine className="w-4 h-4" /> Write Review
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Rating overview */}
        <div className="brutal-card bg-paper-100 p-6 text-center">
          <p className="text-4xl font-bold">{ratingsAvg.toFixed(1)}</p>
          <Rating value={ratingsAvg} size="lg" className="justify-center mt-2" />
          <p className="text-sm text-ink-500 mt-1">{ratingsCount} reviews</p>
        </div>

        {/* Distribution */}
        <div className="md:col-span-2 brutal-card bg-white p-4 space-y-2">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3">
              <span className="text-xs font-bold w-8 flex items-center gap-0.5">
                {d.star} <Star className="w-3 h-3 fill-accent-400 text-accent-400" />
              </span>
              <div className="flex-1 h-3 bg-paper-200 brutal-border overflow-hidden">
                <div
                  className="h-full bg-accent-400 transition-all duration-500"
                  style={{ width: `${d.percent}%` }}
                />
              </div>
              <span className="text-xs text-ink-500 w-8 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {localReviews.length === 0 ? (
          <div className="brutal-card bg-white p-8 text-center">
            <p className="text-sm text-ink-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          localReviews.map((review) => (
            <div key={review._id} className="brutal-card bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{review.userName}</span>
                    {review.isVerifiedPurchase && (
                      <Badge variant="success" size="sm">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  <Rating value={review.rating} size="sm" />
                  {review.title && <p className="font-semibold text-sm mt-2">{review.title}</p>}
                  <p className="text-sm text-ink-600 mt-1">{review.comment}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-ink-400">{formatDate(review.createdAt)}</span>
                    <button
                      onClick={() => toggleHelpful(review._id)}
                      className={cn(
                        'flex items-center gap-1 text-xs font-semibold transition-colors',
                        helpful.has(review._id) ? 'text-primary-600' : 'text-ink-500 hover:text-ink-900',
                      )}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                    </button>
                    {user?._id === review.user && (
                      <>
                        <button onClick={() => startEditing(review)} className="flex items-center gap-1 text-xs font-semibold text-ink-500 transition-colors hover:text-ink-900"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                        <button onClick={() => setReviewToDelete(review)} className="flex items-center gap-1 text-xs font-semibold text-danger-600 transition-colors hover:text-danger-700"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write review modal */}
      <Modal isOpen={isWriting} onClose={() => { setIsWriting(false); setEditingReview(null); }} title={editingReview ? 'Edit Your Review' : 'Write a Review'} size="md">
        <div className="p-6 space-y-4">
          <div>
            <label className="brutal-label">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      star <= rating ? 'fill-accent-400 text-accent-400' : 'text-ink-300',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" />
          <Textarea label="Review" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell others what you think about this product" rows={5} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setIsWriting(false); setEditingReview(null); }}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editingReview ? 'Save Review' : 'Submit Review'}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={() => { void deleteReview(); }}
        title="Delete review?"
        message="This action cannot be undone."
        confirmLabel="Delete review"
      />
    </div>
  );
}
