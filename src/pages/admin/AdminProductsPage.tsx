import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductImage } from '@/lib/types';
import { GENDERS, PRODUCT_TYPES } from '@/lib/constants';
import { formatPrice, cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';

type EditProduct = Partial<Product> & {
  id?: string;
  images?: string[];
  newImages?: string;
};

const EMPTY: EditProduct = {
  name: '',
  reference: '',
  description: '',
  composition: '',
  price: 0,
  old_price: null,
  gender: 'Homme',
  type: 'T-shirt',
  sizes: [],
  colors: [],
  stock: 0,
  is_featured: false,
  is_promotion: false,
  is_new: true,
  is_active: true,
  images: [],
  newImages: '',
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EditProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .order('created_at', { ascending: false });
    if (error) {
      notify('Erreur de chargement', 'error');
      setLoading(false);
      return;
    }
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase()),
  );

  const startNew = () => setEditing({ ...EMPTY });

  const startEdit = (p: Product) => {
    setEditing({
      ...p,
      images: (p.product_images ?? []).sort((a, b) => a.position - b.position).map((i) => i.url),
      newImages: '',
    });
  };

  const toggleArray = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, images, newImages, ...rest } = editing;
    const payload = {
      ...rest,
      price: Number(rest.price) || 0,
      old_price: rest.old_price ? Number(rest.old_price) : null,
      stock: Number(rest.stock) || 0,
    };

    try {
      let productId = id;
      if (id) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Handle images: parse newImages textarea (one URL per line), merge with existing
      const allImages = [...(images ?? [])];
      if (newImages?.trim()) {
        const urls = newImages.split('\n').map((s) => s.trim()).filter(Boolean);
        allImages.push(...urls);
      }
      if (productId) {
        // Replace all images
        await supabase.from('product_images').delete().eq('product_id', productId);
        if (allImages.length) {
          const rows = allImages.map((url, i) => ({
            product_id: productId,
            url,
            position: i,
          }));
          await supabase.from('product_images').insert(rows);
        }
      }

      notify(id ? 'Produit modifié' : 'Produit ajouté');
      setEditing(null);
      load();
    } catch (err) {
      console.error(err);
      notify('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) {
      notify('Erreur de suppression', 'error');
      return;
    }
    notify('Produit supprimé');
    load();
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Produits</h1>
        <button onClick={startNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          className="input pl-10"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="p-4">Produit</th>
              <th className="p-4">Réf</th>
              <th className="p-4">Genre</th>
              <th className="p-4">Type</th>
              <th className="p-4">Prix</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Badges</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.product_images?.[0]?.url ?? ''}
                      alt={p.name}
                      className="h-12 w-10 rounded object-cover"
                    />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-ink-500">{p.reference}</td>
                <td className="p-4">{p.gender}</td>
                <td className="p-4">{p.type}</td>
                <td className="p-4 font-medium">{formatPrice(p.price)}</td>
                <td className="p-4">
                  <span className={cn(p.stock <= 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-green-600')}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {p.is_new && <span className="badge bg-ink-900 text-white">N</span>}
                    {p.is_promotion && <span className="badge bg-accent-500 text-white">P</span>}
                    {p.is_featured && <span className="badge bg-blue-500 text-white">V</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="text-ink-600 hover:text-ink-900">
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

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing.id ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button onClick={() => setEditing(null)} aria-label="Fermer">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Nom *</label>
                <input className="input" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Référence *</label>
                <input className="input" value={editing.reference ?? ''} onChange={(e) => setEditing({ ...editing, reference: e.target.value })} />
              </div>
              <div>
                <label className="label">Stock</label>
                <input type="number" className="input" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Prix (DT) *</label>
                <input type="number" step="0.01" className="input" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Ancien prix (DT)</label>
                <input type="number" step="0.01" className="input" value={editing.old_price ?? ''} onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className="label">Genre</label>
                <select className="input" value={editing.gender} onChange={(e) => setEditing({ ...editing, gender: e.target.value })}>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea className="input min-h-20" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Composition</label>
                <input className="input" value={editing.composition ?? ''} onChange={(e) => setEditing({ ...editing, composition: e.target.value })} />
              </div>
              <div>
                <label className="label">Tailles (séparées par virgule)</label>
                <input className="input" value={(editing.sizes ?? []).join(', ')} onChange={(e) => setEditing({ ...editing, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
              </div>
              <div>
                <label className="label">Couleurs (séparées par virgule)</label>
                <input className="input" value={(editing.colors ?? []).join(', ')} onChange={(e) => setEditing({ ...editing, colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Images (une URL par ligne)</label>
                <textarea
                  className="input min-h-24 font-mono text-xs"
                  placeholder="https://images.pexels.com/..."
                  defaultValue={editing.newImages}
                  onChange={(e) => setEditing({ ...editing, newImages: e.target.value })}
                />
                {editing.images && editing.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editing.images.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="h-16 w-12 rounded object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, images: editing.images?.filter((_, idx) => idx !== i) })}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_new} onChange={(e) => setEditing({ ...editing, is_new: e.target.checked })} className="h-4 w-4 accent-ink-900" />
                  Nouveau
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_promotion} onChange={(e) => setEditing({ ...editing, is_promotion: e.target.checked })} className="h-4 w-4 accent-ink-900" />
                  Promotion
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="h-4 w-4 accent-ink-900" />
                  Vedette
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="h-4 w-4 accent-ink-900" />
                  Actif
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="btn-ghost">Annuler</button>
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
