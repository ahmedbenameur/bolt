import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import { GENDERS, PRODUCT_TYPES } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      notify('Erreur', 'error');
      setLoading(false);
      return;
    }
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  }

  const save = async () => {
    if (!editing?.name) return;
    const payload = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      gender: editing.gender || null,
      type: editing.type || null,
      is_gender_category: editing.is_gender_category ?? false,
    };
    if (editing.id) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) { notify('Erreur', 'error'); return; }
      notify('Catégorie modifiée');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) { notify('Erreur', 'error'); return; }
      notify('Catégorie ajoutée');
    }
    setEditing(null);
    load();
  };

  const remove = async (c: Category) => {
    if (!confirm(`Supprimer "${c.name}" ?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) { notify('Erreur', 'error'); return; }
    notify('Catégorie supprimée');
    load();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Catégories</h1>
        <button onClick={() => setEditing({ name: '', is_gender_category: false })} className="btn-primary">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-ink-500">
                {c.is_gender_category ? 'Genre' : c.type ?? 'Sous-type'}
                {c.gender ? ` · ${c.gender}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="text-ink-600 hover:text-ink-900">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(c)} className="text-ink-600 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? 'Modifier' : 'Nouvelle catégorie'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Nom</label>
                <input className="input" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
              </div>
              <div>
                <label className="label">Slug</label>
                <input className="input" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={editing.is_gender_category ? 'gender' : 'type'} onChange={(e) => setEditing({ ...editing, is_gender_category: e.target.value === 'gender' })}>
                  <option value="type">Sous-type (T-shirt, Pantalon...)</option>
                  <option value="gender">Genre (Homme, Femme, Enfant)</option>
                </select>
              </div>
              {!editing.is_gender_category && (
                <div>
                  <label className="label">Type de produit</label>
                  <select className="input" value={editing.type ?? ''} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                    <option value="">— Aucun —</option>
                    {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
              {editing.is_gender_category && (
                <div>
                  <label className="label">Genre</label>
                  <select className="input" value={editing.gender ?? ''} onChange={(e) => setEditing({ ...editing, gender: e.target.value })}>
                    <option value="">— Aucun —</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}
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
