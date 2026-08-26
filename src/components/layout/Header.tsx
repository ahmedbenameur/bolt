import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { GENDERS, STORE_NAME, STORE_TAGLINE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Header() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ink-900 text-white">
        <div className="container-app flex h-9 items-center justify-center text-xs tracking-wide">
          <span className="hidden sm:inline">Livraison partout en Tunisie</span>
          <span className="sm:hidden">Livraison Tunisie</span>
          <span className="mx-2">•</span>
          <span>Paiement à la livraison</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="container-app flex h-16 items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex flex-col items-center lg:items-start">
            <span className="font-display text-2xl font-bold tracking-tight">{STORE_NAME}</span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-ink-500 lg:block">
              {STORE_TAGLINE}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {GENDERS.map((g) => (
              <Link
                key={g}
                to={`/catalogue?gender=${g}`}
                className="link-underline text-sm font-medium uppercase tracking-wide text-ink-700 hover:text-ink-900"
              >
                {g}
              </Link>
            ))}
            <Link
              to="/catalogue?promo=1"
              className="link-underline text-sm font-medium uppercase tracking-wide text-accent-600 hover:text-accent-700"
            >
              Promotions
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-ink-700 hover:text-ink-900"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link to="/wishlist" className="relative text-ink-700 hover:text-ink-900" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-semibold text-white">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/panier" className="relative text-ink-700 hover:text-ink-900" aria-label="Panier">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-fade-in">
          <div className="container-app flex h-16 items-center justify-between border-b border-ink-100">
            <form
              className="flex flex-1 items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/catalogue?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
            >
              <Search className="h-5 w-5 text-ink-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit ou une référence..."
                className="flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-ink-400"
              />
            </form>
            <button onClick={() => setSearchOpen(false)} aria-label="Fermer">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="container-app py-8">
            <p className="text-sm text-ink-500">
              Tapez pour rechercher parmi nos produits par nom ou référence.
            </p>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80%] animate-slide-in-right bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl font-bold">{STORE_NAME}</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Fermer">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {GENDERS.map((g) => (
                <Link
                  key={g}
                  to={`/catalogue?gender=${g}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wide text-ink-800 hover:bg-ink-100',
                  )}
                >
                  {g}
                </Link>
              ))}
              <Link
                to="/catalogue?promo=1"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wide text-accent-600 hover:bg-ink-100"
              >
                Promotions
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wide text-ink-800 hover:bg-ink-100"
              >
                Liste de souhaits
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
