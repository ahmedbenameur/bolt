import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { TUNISIAN_GOVERNORATES, DEFAULT_SHIPPING_FEE } from '@/lib/constants';
import { formatPrice, generateOrderId } from '@/lib/utils';

type FormState = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  address: string;
  postal_code: string;
  note: string;
  promo_code: string;
};

const EMPTY: FormState = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  governorate: '',
  city: '',
  address: '',
  postal_code: '',
  note: '',
  promo_code: '',
};

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { notify } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string } | null>(null);
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
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

  const total = Math.max(0, subtotal - discount + shippingFee);

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const applyPromo = async () => {
    if (!form.promo_code) return;
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', form.promo_code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      notify('Code promo invalide', 'error');
      setDiscount(0);
      setPromoApplied(null);
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      notify('Code promo expiré', 'error');
      return;
    }
    const d =
      data.discount_type === 'percent'
        ? (subtotal * Number(data.discount_value)) / 100
        : Number(data.discount_value);
    setDiscount(d);
    setPromoApplied(data.code);
    notify(`Code promo appliqué: -${formatPrice(d)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setSubmitting(true);

    try {
      const orderNumber = generateOrderId();
      const customerId = crypto.randomUUID();
      const orderId = crypto.randomUUID();

      // 1. Insert customer
      const { error: custError } = await supabase.from('customers').insert({
        id: customerId,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email || null,
        governorate: form.governorate,
        city: form.city,
        address: form.address,
        postal_code: form.postal_code || null,
      });
      if (custError) throw custError;

      // 2. Insert order
      const { error: orderError } = await supabase.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        customer_id: customerId,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email || null,
        governorate: form.governorate,
        city: form.city,
        address: form.address,
        postal_code: form.postal_code || null,
        note: form.note || null,
        subtotal,
        shipping_fee: shippingFee,
        discount,
        total,
        promo_code: promoApplied,
        status: 'nouvelle',
      });
      if (orderError) throw orderError;

      // 3. Insert order items
      const orderItems = items.map((i) => ({
        order_id: orderId,
        product_id: i.product_id,
        product_name: i.name,
        product_reference: i.reference,
        product_image: i.image,
        size: i.size,
        color: i.color,
        price: i.price,
        quantity: i.quantity,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 4. Trigger admin email via edge function (fire and forget)
      try {
        const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/order-notify`;
        await fetch(fnUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ orderId: orderId }),
        });
      } catch {
        // non-blocking — order is still saved
      }

      clearCart();
      setDone({ orderNumber });
    } catch (err) {
      notify("Erreur lors de la commande. Réessayez.", 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Merci pour votre commande</h1>
        <p className="mt-3 max-w-md text-ink-600">
          Nous vous contacterons rapidement pour confirmer la livraison.
          Votre numéro de commande est:
        </p>
        <p className="mt-2 text-lg font-semibold text-ink-900">{done.orderNumber}</p>
        <Link to="/catalogue" className="mt-8 btn-primary">
          Continuer mes achats
        </Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-app flex h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold">Votre panier est vide</h1>
        <Link to="/catalogue" className="mt-4 btn-primary">
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <Link
        to="/panier"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft className="h-4 w-4" /> Retour au panier
      </Link>

      <h1 className="mb-8 font-display text-3xl font-bold">Commande</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-ink-100 p-6">
            <h2 className="mb-4 text-lg font-semibold">Informations de livraison</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nom *</label>
                <input
                  required
                  className="input"
                  value={form.last_name}
                  onChange={(e) => update('last_name', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Prénom *</label>
                <input
                  required
                  className="input"
                  value={form.first_name}
                  onChange={(e) => update('first_name', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Téléphone *</label>
                <input
                  required
                  type="tel"
                  className="input"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Email (optionnel)</label>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Gouvernorat *</label>
                <select
                  required
                  className="input"
                  value={form.governorate}
                  onChange={(e) => update('governorate', e.target.value)}
                >
                  <option value="">— Choisir —</option>
                  {TUNISIAN_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ville *</label>
                <input
                  required
                  className="input"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Adresse *</label>
                <input
                  required
                  className="input"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Code postal</label>
                <input
                  className="input"
                  value={form.postal_code}
                  onChange={(e) => update('postal_code', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Remarque</label>
                <textarea
                  className="input min-h-20"
                  value={form.note}
                  onChange={(e) => update('note', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 p-6">
            <h2 className="mb-4 text-lg font-semibold">Code promo</h2>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Entrez votre code"
                value={form.promo_code}
                onChange={(e) => update('promo_code', e.target.value.toUpperCase())}
              />
              <button type="button" onClick={applyPromo} className="btn-outline">
                Appliquer
              </button>
            </div>
            {promoApplied && (
              <p className="mt-2 text-sm text-green-600">
                Code "{promoApplied}" appliqué
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-ink-100 p-6">
            <h2 className="text-lg font-semibold">Votre commande</h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((i) => (
                <div key={`${i.product_id}-${i.size}-${i.color}`} className="flex gap-3">
                  <img
                    src={i.image ?? ''}
                    alt={i.name}
                    className="h-16 w-12 rounded object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-ink-500">
                      {i.size} · {i.color} · ×{i.quantity}
                    </p>
                    <p className="font-medium">{formatPrice(i.price * i.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Sous-total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-600">Livraison</span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-2 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !form.governorate}
              className="mt-6 btn-primary w-full"
            >
              {submitting ? 'Traitement...' : 'Confirmer la commande'}
            </button>
            <p className="mt-3 text-center text-xs text-ink-500">
              Paiement à la livraison (Cash)
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
