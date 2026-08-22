const storageKey = 'electromart-recently-viewed-v1';
const updateEvent = 'electromart:recently-viewed-updated';

export function recentlyViewedProductIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(0, 10) : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewedProduct(productId: string): void {
  if (typeof window === 'undefined' || !productId) return;
  const next = [productId, ...recentlyViewedProductIds().filter((id) => id !== productId)].slice(0, 10);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(updateEvent));
  } catch {
    // Browsing history is an optional, local-only enhancement.
  }
}

export const recentlyViewedUpdatedEvent = updateEvent;
