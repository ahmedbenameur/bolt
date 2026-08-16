import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PromoCode } from '@/lib/types';
import { formatDateShort } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';

const EMPTY: Partial<PromoCode> = {
  code: '',
  discount_type: 'percent',
  discount_value: 10,
  is_active: true,
  expires_at: null,
};

export function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PromoCode> | null>(null);
  const { notify } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    if (error) { notify('Erreur', 'error'); setLoading(false); return; }
    setPromos((data as PromoCode[]) ?? []);
    setLoading(false);
  }

  const save = async () => {
    if (!editing?.code) return;
    const payload = {
      code: editing.code.toUpperCase(),
      discount_type: editing.discount_type,
      discount_value: Number(editing.discount_value) || 0,
      is_active: editing.is_active ?? true,
      expires_at: editing.expires_at || null,
    };
    if (editing.id) {
      const { error } = await supabase.from('promo_codes').update(payload).eq('id', editing.id);
      if (error) { notify('Erreur', 'error'); return; }
      notify('Code modifié');
    } else {
      const { error } = await supabase.from('promo_codes').insert(payload);
      if (error) { notify('Erreur', 'error'); return; }
      notify('Code ajouté');
    }
    setEditing(null);
    load();
  };

  const remove = async (p: PromoCode) => {
    if (!confirm(`Supprimer "${p.code}" ?`)) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', p.id);
    if (error) { notify('Erreur', 'error'); return; }
    notify('Code supprimé');
    load();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Codes promo</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Type</th>
              <th className="p-4">Valeur</th>
              <th className="p-4">Expire</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {promos.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50">
                <td className="p-4 font-mono font-medium">{p.code}</td>
                <td className="p-4">{p.discount_type === 'percent' ? 'Pourcentage' : 'Montant fixe'}</td>
                <td className="p-4">{p.discount_type === 'percent' ? `${p.discount_value}%` : `${p.discount_value} DT`}</td>
                <td className="p-4 text-ink-500">{p.expires_at ? formatDateShort(p.expires_at) : 'Jamais'}</td>
                <td className="p-4">
                  <span className={`badge ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                    {p.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(p)} className="text-ink-600 hover:text-ink-900">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(p)} className="text-ink-600 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? 'Modifier' : 'Nouveau code'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Code</label>
                <input className="input uppercase" value={editing.code ?? ''} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="label">Type de remise</label>
                <select className="input" value={editing.discount_type} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value as 'percent' | 'fixed' })}>
                  <option value="percent">Pourcentage</option>
                  <option value="fixed">Montant fixe (DT)</option>
                </select>
              </div>
              <div>
                <label className="label">Valeur</label>
                <input type="number" step="0.01" className="input" value={editing.discount_value ?? 0} onChange={(e) => setEditing({ ...editing, discount_value: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Date d'expiration (optionnel)</label>
                <input type="date" className="input" value={editing.expires_at?.slice(0, 10) ?? ''} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="h-4 w-4 accent-ink-900" />
                Actif
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="btn-ghost">Annuler</button>
              <button onClick={save} className="btn-primary">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
