import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, ChevronLeft, ZoomIn, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import type { Product } from '@/lib/types';
import { fetchProductById, fetchSimilarProducts, getImages, getMainImage } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, cn } from '@/lib/utils';
import { PageLoader } from '@/components/ui/Spinner';
import { ProductCard } from '@/components/ProductCard';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { add } = useRecentlyViewed();
  const { notify } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProductById(id)
      .then((p) => {
        setProduct(p);
        if (p) {
          add(p.id);
          setSelectedSize(p.sizes[0] ?? '');
          setSelectedColor(p.colors[0] ?? '');
          fetchSimilarProducts(p, 4).then(setSimilar).catch(() => setSimilar([]));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!product)
    return (
      <div className="container-app flex h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold">Produit introuvable</h1>
        <Link to="/catalogue" className="mt-4 btn-primary">
          Retour au catalogue
        </Link>
      </div>
    );

  const images = getImages(product);
  const mainImage = images[selectedImage]?.url ?? getMainImage(product);
  const inWishlist = has(product.id);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    if (product.sizes.length > 0 && !selectedSize) {
      notify('Veuillez choisir une taille', 'error');
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      notify('Veuillez choisir une couleur', 'error');
      return;
    }
    addItem({
      product_id: product.id,
      name: product.name,
      reference: product.reference,
      image: mainImage,
      price: product.price,
      size: selectedSize || 'Unique',
      color: selectedColor || 'Standard',
      quantity: 1,
      stock: product.stock,
    });
    notify('Produit ajouté au panier');
  };

  return (
    <div className="container-app py-8">
      <Link
        to="/catalogue"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {images.length > 1 && (
            <div className="flex gap-2 sm:flex-col">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'h-20 w-16 overflow-hidden rounded-lg border-2 transition',
                    selectedImage === i ? 'border-ink-900' : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <img src={img.url} alt={img.alt ?? product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div
            className="relative flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-ink-50"
            onClick={() => setZoomed(true)}
          >
            <img
              src={mainImage}
              alt={product.name}
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700">
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            {product.is_new && <span className="badge bg-ink-900 text-white">Nouveau</span>}
            {product.is_promotion && <span className="badge bg-accent-500 text-white">Promo</span>}
            {product.is_featured && <span className="badge bg-ink-100 text-ink-700">Vedette</span>}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-500">Réf: {product.reference}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.old_price && (
              <span className="text-lg text-ink-400 line-through">{formatPrice(product.old_price)}</span>
            )}
          </div>

          <div className="mt-2">
            {outOfStock ? (
              <span className="text-sm font-medium text-red-600">Rupture de stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-sm font-medium text-amber-600">
                Plus que {product.stock} en stock
              </span>
            ) : (
              <span className="text-sm font-medium text-green-600">En stock</span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink-700">{product.description}</p>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="label mb-0">Taille</span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-ink-500 underline hover:text-ink-900"
                >
                  Guide des tailles
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      'min-w-12 rounded-lg border px-4 py-2.5 text-sm font-medium transition',
                      selectedSize === s
                        ? 'border-ink-900 bg-ink-900 text-white'
                        : 'border-ink-200 text-ink-700 hover:border-ink-400',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mt-5">
              <span className="label">Couleur: {selectedColor}</span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={cn(
                      'rounded-lg border px-4 py-2.5 text-sm font-medium transition',
                      selectedColor === c
                        ? 'border-ink-900 bg-ink-900 text-white'
                        : 'border-ink-200 text-ink-700 hover:border-ink-400',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composition */}
          {product.composition && (
            <div className="mt-5">
              <span className="label">Composition</span>
              <p className="text-sm text-ink-700">{product.composition}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-primary flex-1"
            >
              <ShoppingBag className="h-4 w-4" />
              {outOfStock ? 'Indisponible' : 'Ajouter au panier'}
            </button>
            <button
              onClick={() => {
                toggle(product.id);
                notify(inWishlist ? 'Retiré de la wishlist' : 'Ajouté à la wishlist', 'info');
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
              aria-label="Wishlist"
            >
              <Heart className={cn('h-5 w-5', inWishlist && 'fill-accent-500 text-accent-500')} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink-100 pt-6">
            <div className="text-center">
              <Truck className="mx-auto h-6 w-6 text-ink-700" />
              <p className="mt-1 text-xs text-ink-500">Livraison Tunisie</p>
            </div>
            <div className="text-center">
              <ShieldCheck className="mx-auto h-6 w-6 text-ink-700" />
              <p className="mt-1 text-xs text-ink-500">Paiement à la livraison</p>
            </div>
            <div className="text-center">
              <RotateCcw className="mx-auto h-6 w-6 text-ink-700" />
              <p className="mt-1 text-xs text-ink-500">Retour 7 jours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">Produits similaires</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Zoom modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(false)}
        >
          <img src={mainImage} alt={product.name} className="max-h-full max-w-full object-contain" />
          <button
            className="absolute right-6 top-6 text-white"
            onClick={() => setZoomed(false)}
            aria-label="Fermer"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
      )}

      {/* Size guide */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Guide des tailles</h3>
              <button onClick={() => setShowSizeGuide(false)} aria-label="Fermer">
                <span className="text-2xl">×</span>
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="py-2">Taille</th>
                  <th className="py-2">Tour de poitrine (cm)</th>
                  <th className="py-2">Tour de taille (cm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['XS', '80-84', '62-66'],
                  ['S', '86-90', '68-72'],
                  ['M', '92-96', '74-78'],
                  ['L', '98-102', '80-84'],
                  ['XL', '104-110', '86-92'],
                  ['XXL', '112-118', '94-100'],
                ].map(([s, p, w]) => (
                  <tr key={s} className="border-b border-ink-50">
                    <td className="py-2 font-medium">{s}</td>
                    <td className="py-2">{p}</td>
                    <td className="py-2">{w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-ink-500">
              Les mesures sont indicatives et peuvent varier selon la coupe du vêtement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
