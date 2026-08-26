import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { Product } from '@/lib/types';
import { fetchProductsByIds } from '@/lib/api';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Spinner';

export function RecentlyViewedPage() {
  const { ids } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsByIds(ids)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="container-app py-8">
      <div className="mb-8 flex items-center gap-3">
        <Clock className="h-7 w-7 text-ink-700" />
        <h1 className="font-display text-3xl font-bold">Récemment consultés</h1>
      </div>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-ink-700">Aucun produit consulté récemment</p>
          <Link to="/catalogue" className="mt-6 btn-primary">
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
