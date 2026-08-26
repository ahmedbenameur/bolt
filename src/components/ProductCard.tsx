import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getMainImage } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

export function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const { addItem } = useCart();
  const { notify } = useToast();
  const image = getMainImage(product);
  const inWishlist = has(product.id);
  const outOfStock = product.stock <= 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      product_id: product.id,
      name: product.name,
      reference: product.reference,
      image,
      price: product.price,
      size: product.sizes[0] ?? 'Unique',
      color: product.colors[0] ?? 'Standard',
      quantity: 1,
      stock: product.stock,
    });
    notify('Produit ajouté au panier');
  };

  return (
    <Link to={`/produit/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ink-50">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
            outOfStock && 'opacity-60',
          )}
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_new && <span className="badge bg-ink-900 text-white">Nouveau</span>}
          {product.is_promotion && product.old_price && (
            <span className="badge bg-accent-500 text-white">
              -{Math.round((1 - product.price / product.old_price) * 100)}%
            </span>
          )}
          {outOfStock && <span className="badge bg-red-500 text-white">Épuisé</span>}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
            notify(inWishlist ? 'Retiré de la wishlist' : 'Ajouté à la wishlist', 'info');
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-accent-500"
          aria-label="Ajouter à la wishlist"
        >
          <Heart className={cn('h-4 w-4', inWishlist && 'fill-accent-500 text-accent-500')} />
        </button>

        {/* Quick add */}
        {!outOfStock && (
          <button
            onClick={quickAdd}
            className="absolute bottom-0 left-0 right-0 flex h-11 items-center justify-center gap-2 bg-ink-900/90 text-xs font-medium uppercase tracking-wide text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <ShoppingBag className="h-4 w-4" /> Ajout rapide
          </button>
        )}
      </div>

      <div className="mt-3 px-1">
        <h3 className="truncate text-sm font-medium text-ink-900">{product.name}</h3>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-ink-400">{product.type}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">{formatPrice(product.price)}</span>
          {product.old_price && (
            <span className="text-xs text-ink-400 line-through">{formatPrice(product.old_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
