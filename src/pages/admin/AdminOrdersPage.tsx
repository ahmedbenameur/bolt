import { useEffect, useState } from 'react';
import { Search, Eye, Download, FileText, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderItem } from '@/lib/types';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatPrice, toCSV, downloadFile, cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [updating, setUpdating] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      notify('Erreur de chargement', 'error');
      setLoading(false);
      return;
    }
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  const viewOrder = async (o: Order) => {
    setSelected(o);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', o.id);
    setItems((data as OrderItem[]) ?? []);
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    setUpdating(false);
    if (error) {
      notify('Erreur', 'error');
      return;
    }
    notify('Statut mis à jour');
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (selected?.id === orderId) setSelected({ ...selected, status });
  };

  const exportCSV = () => {
    const rows = filtered.map((o) => ({
      Numero: o.order_number,
      Date: formatDate(o.created_at),
      Nom: `${o.first_name} ${o.last_name}`,
      Telephone: o.phone,
      Email: o.email ?? '',
      Gouvernorat: o.governorate,
      Ville: o.city,
      Adresse: o.address,
      Sous_total: o.subtotal,
      Livraison: o.shipping_fee,
      Remise: o.discount,
      Total: o.total,
      Statut: ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status,
    }));
    downloadFile('commandes.csv', toCSV(rows), 'text/csv;charset=utf-8');
  };

  const generateInvoice = (o: Order) => {
    const html = generateInvoiceHTML(o, items);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      `${o.first_name} ${o.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Commandes</h1>
        <button onClick={exportCSV} className="btn-outline">
          <Download className="h-4 w-4" /> Exporter Excel
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-10"
            placeholder="N° commande, nom, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input max-w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous statuts</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="p-4">N° Commande</th>
              <th className="p-4">Date</th>
              <th className="p-4">Client</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Total</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-ink-50">
                <td className="p-4 font-medium">{o.order_number}</td>
                <td className="p-4 text-ink-500">{formatDate(o.created_at)}</td>
                <td className="p-4">{o.first_name} {o.last_name}</td>
                <td className="p-4">{o.phone}</td>
                <td className="p-4 font-semibold">{formatPrice(o.total)}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    disabled={updating}
                    className={cn('rounded-full border-0 px-3 py-1 text-xs font-medium', ORDER_STATUS_COLORS[o.status as keyof typeof ORDER_STATUS_COLORS])}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => viewOrder(o)} className="text-ink-600 hover:text-ink-900" aria-label="Voir">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => generateInvoice(o)} className="text-ink-600 hover:text-ink-900" aria-label="Facture">
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelected(null)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-white p-6 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Commande {selected.order_number}</h2>
              <button onClick={() => setSelected(null)} aria-label="Fermer">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-ink-500">Date</p>
                <p className="font-medium">{formatDate(selected.created_at)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-ink-500">Client</p>
                  <p className="font-medium">{selected.first_name} {selected.last_name}</p>
                </div>
                <div>
                  <p className="text-ink-500">Téléphone</p>
                  <p className="font-medium">{selected.phone}</p>
                </div>
                <div>
                  <p className="text-ink-500">Email</p>
                  <p className="font-medium">{selected.email ?? '—'}</p>
                </div>
                <div>
                  <p className="text-ink-500">Gouvernorat</p>
                  <p className="font-medium">{selected.governorate}</p>
                </div>
                <div>
                  <p className="text-ink-500">Ville</p>
                  <p className="font-medium">{selected.city}</p>
                </div>
                <div>
                  <p className="text-ink-500">Code postal</p>
                  <p className="font-medium">{selected.postal_code ?? '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-ink-500">Adresse</p>
                <p className="font-medium">{selected.address}</p>
              </div>
              {selected.note && (
                <div>
                  <p className="text-ink-500">Remarque</p>
                  <p className="font-medium">{selected.note}</p>
                </div>
              )}

              <div className="border-t border-ink-100 pt-4">
                <p className="mb-2 font-semibold">Articles</p>
                <div className="space-y-3">
                  {items.map((it) => (
                    <div key={it.id} className="flex gap-3">
                      {it.product_image && (
                        <img src={it.product_image} alt={it.product_name} className="h-16 w-12 rounded object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{it.product_name}</p>
                        <p className="text-xs text-ink-500">{it.product_reference} · {it.size} · {it.color}</p>
                        <p className="text-xs">×{it.quantity} — {formatPrice(it.price * it.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 border-t border-ink-100 pt-4">
                <div className="flex justify-between"><span className="text-ink-500">Sous-total</span><span>{formatPrice(selected.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-ink-500">Livraison</span><span>{formatPrice(selected.shipping_fee)}</span></div>
                {selected.discount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Remise</span><span>-{formatPrice(selected.discount)}</span></div>
                )}
                <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
              </div>

              <button onClick={() => generateInvoice(selected)} className="btn-outline w-full">
                <FileText className="h-4 w-4" /> Générer facture PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateInvoiceHTML(order: Order, items: OrderItem[]): string {
  const rows = items.map(
    (it) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${it.product_name}<br/><small>${it.product_reference}</small></td>
      <td style="padding:8px;border-bottom:1px solid #eee">${it.size ?? ''} / ${it.color ?? ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${Number(it.price).toFixed(2)} DT</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${(Number(it.price) * it.quantity).toFixed(2)} DT</td>
    </tr>`,
  ).join('');

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Facture ${order.order_number}</title>
  <style>
    body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#1a1a1f}
    h1{font-size:28px;margin:0}.muted{color:#85858f;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-top:16px;font-size:14px}
    th{text-align:left;padding:8px;border-bottom:2px solid #1a1a1f;font-size:12px;text-transform:uppercase}
    .total{font-size:18px;font-weight:bold;margin-top:16px;text-align:right}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
    .box{background:#f6f6f7;padding:16px;border-radius:8px;font-size:13px}
  </style></head><body>
    <div class="header">
      <div><h1>TUNISIA</h1><p class="muted">Boutique de mode en ligne<br/>Tunis, Tunisie</p></div>
      <div style="text-align:right"><h1>Facture</h1><p class="muted">${order.order_number}<br/>${formatDate(order.created_at)}</p></div>
    </div>
    <div class="box" style="margin-bottom:24px">
      <strong>Client:</strong> ${order.first_name} ${order.last_name}<br/>
      <strong>Téléphone:</strong> ${order.phone}<br/>
      ${order.email ? `<strong>Email:</strong> ${order.email}<br/>` : ''}
      <strong>Adresse:</strong> ${order.address}, ${order.city}, ${order.governorate} ${order.postal_code ?? ''}
      ${order.note ? `<br/><strong>Remarque:</strong> ${order.note}` : ''}
    </div>
    <table>
      <thead><tr><th>Produit</th><th>Taille/Couleur</th><th style="text-align:center">Qté</th><th style="text-align:right">Prix</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="total">
      <div style="display:flex;justify-content:space-between;max-width:300px;margin-left:auto">
        <span>Sous-total:</span><span>${Number(order.subtotal).toFixed(2)} DT</span>
      </div>
      <div style="display:flex;justify-content:space-between;max-width:300px;margin-left:auto">
        <span>Livraison:</span><span>${Number(order.shipping_fee).toFixed(2)} DT</span>
      </div>
      ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;max-width:300px;margin-left:auto"><span>Remise:</span><span>-${Number(order.discount).toFixed(2)} DT</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;max-width:300px;margin-left:auto;margin-top:8px;font-size:22px">
        <span>Total:</span><span>${Number(order.total).toFixed(2)} DT</span>
      </div>
    </div>
    <p style="margin-top:48px;text-align:center" class="muted">Merci pour votre commande — Paiement à la livraison</p>
    <script>window.onload=function(){window.print()}</script>
  </body></html>`;
}
