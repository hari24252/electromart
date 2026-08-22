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
import { useDataStore } from '@/stores/dataStore';
import { api } from '@/api/services';
import type { Product, Review } from '@/types';
import { recordRecentlyViewedProduct } from '@/lib/recentlyViewed';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const getProductBySlug = useDataStore((s) => s.getProductBySlug);
  const getRelatedProducts = useDataStore((s) => s.getRelatedProducts);
  const categories = useDataStore((s) => s.categories);
  const [product, setProduct] = useState<Product | undefined>(() => slug ? getProductBySlug(slug) : undefined);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    void api.catalogue.product(slug)
      .then(async (loadedProduct) => {
        const [loadedRelated, loadedReviews] = await Promise.all([
          api.catalogue.related(slug).catch(() => getRelatedProducts(slug)),
          api.reviews.list(loadedProduct._id).catch(() => []),
        ]);
        if (!active) return;
        setProduct(loadedProduct);
        recordRecentlyViewedProduct(loadedProduct._id);
        setRelated(loadedRelated);
        setReviews(loadedReviews);
      })
      .catch(() => {
        if (!active) return;
        const fallback = getProductBySlug(slug);
        setProduct(fallback);
        if (fallback) recordRecentlyViewedProduct(fallback._id);
        setRelated(fallback ? getRelatedProducts(fallback.slug) : []);
        setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [getProductBySlug, getRelatedProducts, slug]);

  if (loading && !product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-bold uppercase text-ink-400">Loading product…</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Product Not Found</h1>
        <p className="text-sm text-ink-500 mb-6">This product may have been removed or is no longer available.</p>
        <Link to="/catalog" className="inline-flex items-center gap-2 brutal-border bg-ink-900 text-white px-6 py-3 font-bold text-sm uppercase">
          Back to Catalog <ArrowRight className="w-4 h-4" />
        </Link>
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
          ...(category ? [{ label: category.name, href: `/catalog?category=${category.slug}` }] : []),
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
