import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { STORE_NAME, GENDERS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-ink-50">
      <div className="container-app grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-2xl font-bold">{STORE_NAME}</h3>
          <p className="mt-2 text-sm text-ink-500">
            Mode & élégance pour toute la famille. Livraison partout en Tunisie.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" className="text-ink-500 hover:text-ink-900" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-ink-500 hover:text-ink-900" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-600">Boutique</h4>
          <ul className="space-y-2 text-sm text-ink-700">
            {GENDERS.map((g) => (
              <li key={g}>
                <Link to={`/catalogue?gender=${g}`} className="hover:text-ink-900">
                  {g}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/catalogue?promo=1" className="hover:text-ink-900">
                Promotions
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-600">Aide</h4>
          <ul className="space-y-2 text-sm text-ink-700">
            <li>Livraison & retours</li>
            <li>Guide des tailles</li>
            <li>Paiement à la livraison</li>
            <li>Nous contacter</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-600">Contact</h4>
          <ul className="space-y-2 text-sm text-ink-700">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +216 00 000 000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> contact@tunisia.tn
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Tunis, Tunisie
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-100 py-6">
        <div className="container-app flex flex-col items-center justify-between gap-2 text-xs text-ink-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {STORE_NAME}. Tous droits réservés.</span>
          <span>Conçu en Tunisie</span>
        </div>
      </div>
    </footer>
  );
}
