import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { fetchProductsByIds } from '@/lib/api';
import { useWishlist } from '@/contexts/WishlistContext';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Spinner';

export function WishlistPage() {
  const { ids } = useWishlist();
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
        <Heart className="h-7 w-7 text-accent-500" />
        <h1 className="font-display text-3xl font-bold">Liste de souhaits</h1>
      </div>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center text-center">
          <Heart className="h-16 w-16 text-ink-300" />
          <p className="mt-4 text-lg font-medium text-ink-700">Votre liste de souhaits est vide</p>
          <p className="mt-1 text-sm text-ink-500">
            Cliquez sur le cœur d'un produit pour l'ajouter ici.
          </p>
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
