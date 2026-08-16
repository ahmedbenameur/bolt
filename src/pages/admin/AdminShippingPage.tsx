import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';
import { Truck } from 'lucide-react';

export function AdminShippingPage() {
  const [fee, setFee] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping_fee')
      .maybeSingle();
    if (error) { notify('Erreur', 'error'); setLoading(false); return; }
    if (data) setFee(Number(data.value));
    setLoading(false);
  }

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key: 'shipping_fee', value: fee });
    setSaving(false);
    if (error) { notify('Erreur', 'error'); return; }
    notify('Frais de livraison mis à jour');
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Frais de livraison</h1>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100">
            <Truck className="h-6 w-6 text-ink-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Frais de livraison unique</h2>
            <p className="mt-1 text-sm text-ink-500">
              Ce montant sera appliqué à toutes les commandes, quel que soit le gouvernorat.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="number"
            step="0.5"
            min="0"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-32 rounded-lg border border-ink-200 px-4 py-2.5 text-lg font-semibold outline-none focus:border-ink-900"
          />
          <span className="text-lg font-medium text-ink-600">DT</span>
        </div>

        <div className="mt-4 rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-600">
          Aperçu: un client paiera <span className="font-semibold">{formatPrice(fee)}</span> de livraison pour toute commande.
        </div>
      </div>
    </div>
  );
}
