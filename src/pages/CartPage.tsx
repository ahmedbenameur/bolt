import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { DEFAULT_SHIPPING_FEE } from '@/lib/constants';

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const [shippingFee, setShippingFee] = useState(DEFAULT_SHIPPING_FEE);

  useEffect(() => {
    supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping_fee')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setShippingFee(Number(data.value));
      });
  }, []);

  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="container-app flex h-[50vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="h-16 w-16 text-ink-300" />
        <h1 className="mt-4 text-2xl font-semibold">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-ink-500">
          Découvrez nos collections et ajoutez vos articles préférés.
        </p>
        <Link to="/catalogue" className="mt-6 btn-primary">
          Continuer mes achats <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-8 font-display text-3xl font-bold">Panier</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
            {items.map((item) => (
              <div
                key={`${item.product_id}-${item.size}-${item.color}`}
                className="flex gap-4 p-4"
              >
                <Link to={`/produit/${item.product_id}`} className="shrink-0">
                  <img
                    src={item.image ?? ''}
                    alt={item.name}
                    className="h-28 w-22 rounded-lg object-cover"
                    style={{ width: '5.5rem' }}
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link
                        to={`/produit/${item.product_id}`}
                        className="text-sm font-medium text-ink-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-500">Réf: {item.reference}</p>
                      <p className="mt-1 text-xs text-ink-600">
                        Taille: {item.size} · Couleur: {item.color}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id, item.size, item.color)}
                      className="text-ink-400 hover:text-red-500"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-700 hover:bg-ink-100"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-700 hover:bg-ink-100 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={clearCart}
              className="text-sm text-ink-500 underline hover:text-red-500"
            >
              Vider le panier
            </button>
            <Link to="/catalogue" className="text-sm text-ink-700 underline hover:text-ink-900">
              Continuer mes achats
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-ink-100 p-6">
            <h2 className="text-lg font-semibold">Récapitulatif</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Sous-total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Frais de livraison</span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-3 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
            </div>
            <Link to="/commande" className="mt-6 btn-primary w-full">
              Passer la commande <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-ink-500">
              Paiement à la livraison (Cash on Delivery)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
