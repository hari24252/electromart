import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { ProductGallery } from '@/components/store/ProductGallery';
import { ProductInfo } from '@/components/store/ProductInfo';
import { SpecTable } from '@/components/store/SpecTable';
import { ReviewSection } from '@/components/store/ReviewSection';
import { ProductCard } from '@/components/store/ProductCard';
import { Breadcrumbs, SectionHeader } from '@/components/ui/Misc';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useDataStore } from '@/stores/dataStore';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import type { Product, Review } from '@/types';
import { recordRecentlyViewedProduct } from '@/lib/recentlyViewed';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const getProductBySlug = useDataStore((s) => s.getProductBySlug);
  const categories = useDataStore((s) => s.categories);
  const [product, setProduct] = useState<Product | undefined>(() => slug ? getProductBySlug(slug) : undefined);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError(null);
    void api.catalogue.product(slug)
      .then(async (loadedProduct) => {
        const [relatedResult, reviewResult] = await Promise.allSettled([
          api.catalogue.related(slug),
          api.reviews.list(loadedProduct._id),
        ]);
        if (!active) return;
        setProduct(loadedProduct);
        recordRecentlyViewedProduct(loadedProduct._id);
        setRelated(relatedResult.status === 'fulfilled' ? relatedResult.value : []);
        setReviews(reviewResult.status === 'fulfilled' ? reviewResult.value : []);
      })
      .catch((requestError) => {
        if (!active) return;
        setProduct(undefined);
        setRelated([]);
        setReviews([]);
        setError(getApiErrorMessage(requestError, 'This product could not be loaded. Please try again.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [attempt, slug]);

  if (loading && !product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-bold uppercase text-ink-400">Loading product…</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        {error ? (
          <Alert variant="error" title="Product unavailable" className="mx-auto max-w-lg text-left">
            <p>{error}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => setAttempt((value) => value + 1)}>Try again</Button>
              <Link to="/catalog" className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white">Back to catalog <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </Alert>
        ) : (
          <>
            <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Product Not Found</h1>
            <p className="text-sm text-ink-500 mb-6">This product may have been removed or is no longer available.</p>
            <Link to="/catalog" className="inline-flex items-center gap-2 rounded-lg bg-ink-900 px-6 py-3 text-sm font-medium text-white">Back to Catalog <ArrowRight className="w-4 h-4" /></Link>
          </>
        )}
      </div>
    );
  }

  const categoryId = typeof product.category === 'string' ? product.category : product.category._id;
  const category = categories.find((item) => item._id === categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Helmet>
        <title>{`${product.name} | Electromart`}</title>
        <meta name="description" content={product.shortDescription} />
      </Helmet>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Catalog', href: '/catalog' },
          ...(category ? [{ label: category.name, href: `/?category=${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      {/* Main product section */}
      <div className="grid lg:grid-cols-2 gap-6 mt-4">
        <ProductGallery
          images={product.images}
          alt={product.name}
          category={category ? category.name : typeof product.category === 'string' ? product.category : product.category?.name}
        />
        <ProductInfo product={product} />
      </div>

      {/* Specs / Description / Warranty tabs */}
      <div className="mt-8">
        <SpecTable product={product} />
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <ReviewSection
          productId={product._id}
          reviews={reviews}
          ratingsAvg={product.ratingsAvg ?? 0}
          ratingsCount={product.ratingsCount ?? 0}
        />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12">
          <SectionHeader title="Related Products" subtitle="You might also like these" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
