import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import {
  fetchNewProducts,
  fetchFeaturedProducts,
  fetchPromoProducts,
} from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Spinner';
import { GENDERS } from '@/lib/constants';

const HERO_IMAGE =
  'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg?auto=compress&cs=tinysrgb&w=1600';

const GENDER_IMAGES: Record<string, string> = {
  Homme: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
  Femme: 'https://images.pexels.com/photos/26102191/pexels-photo-26102191.jpeg?auto=compress&cs=tinysrgb&w=800',
  Enfant: 'https://images.pexels.com/photos/34608858/pexels-photo-34608858.jpeg?auto=compress&cs=tinysrgb&w=800',
};

export function HomePage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [promo, setPromo] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchNewProducts(8), fetchFeaturedProducts(8), fetchPromoProducts(8)])
      .then(([n, f, p]) => {
        setNewProducts(n);
        setFeatured(f);
        setPromo(p);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Collection"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        <div className="container-app relative flex h-full flex-col justify-end pb-16 text-white">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/80">
            Collection Automne / Hiver
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            L'élégance<br />tunisienne
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
            Découvrez notre nouvelle collection de vêtements pour homme, femme et enfant.
            Livraison partout en Tunisie, paiement à la livraison.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/catalogue"
              className="btn bg-white text-ink-900 hover:bg-ink-100"
            >
              Découvrir <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/catalogue?promo=1"
              className="btn border border-white text-white hover:bg-white hover:text-ink-900"
            >
              Promotions
            </Link>
          </div>
        </div>
      </section>

      {/* Gender categories */}
      <section className="container-app py-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {GENDERS.map((g) => (
            <Link
              key={g}
              to={`/catalogue?gender=${g}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <img
                src={GENDER_IMAGES[g]}
                alt={g}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h2 className="font-display text-3xl font-bold">{g}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                  Voir la collection <ArrowRight className="h-4 w-4" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-app pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Just arrived</p>
            <h2 className="font-display text-3xl font-bold">Nouveautés</h2>
          </div>
          <Link
            to="/catalogue?sort=recent"
            className="link-underline hidden text-sm font-medium uppercase tracking-wide text-ink-700 sm:inline"
          >
            Tout voir
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Featured */}
      <section className="bg-ink-50 py-16">
        <div className="container-app">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Best-sellers</p>
              <h2 className="font-display text-3xl font-bold">Produits populaires</h2>
            </div>
            <Link
              to="/catalogue?sort=best_selling"
              className="link-underline hidden text-sm font-medium uppercase tracking-wide text-ink-700 sm:inline"
            >
              Tout voir
            </Link>
          </div>
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo */}
      <section className="container-app py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-500">Offres spéciales</p>
            <h2 className="font-display text-3xl font-bold">Promotions</h2>
          </div>
          <Link
            to="/catalogue?promo=1"
            className="link-underline hidden text-sm font-medium uppercase tracking-wide text-ink-700 sm:inline"
          >
            Tout voir
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {promo.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Features strip */}
      <section className="border-t border-ink-100 bg-white py-12">
        <div className="container-app grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wide">Paiement à la livraison</h3>
            <p className="mt-1 text-sm text-ink-500">Payez en espèces à la réception</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wide">Livraison Tunisie</h3>
            <p className="mt-1 text-sm text-ink-500">Grand Tunis 8 DT, autres 10 DT</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wide">Qualité garantie</h3>
            <p className="mt-1 text-sm text-ink-500">Satisfait ou remboursé</p>
          </div>
        </div>
      </section>
    </div>
  );
}
