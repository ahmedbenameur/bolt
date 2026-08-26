import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Users, TrendingUp, Euro,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

type Stats = {
  orders: number;
  revenue: number;
  products: number;
  customers: number;
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ orders: 0, revenue: 0, products: 0, customers: 0 });
  const [chartData, setChartData] = useState<{ date: string; orders: number; revenue: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from('orders').select('total, status, created_at'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
      ]);

      const orders = ordersRes.data ?? [];
      const revenue = orders
        .filter((o) => o.status !== 'annulee')
        .reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        orders: orders.length,
        revenue,
        products: productsRes.count ?? 0,
        customers: customersRes.count ?? 0,
      });

      // Chart: last 7 days
      const days: { date: string; orders: number; revenue: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === key);
        days.push({
          date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
        });
      }
      setChartData(days);

      // Status pie
      const statusCounts: Record<string, number> = {};
      orders.forEach((o) => {
        statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
      });
      const labels: Record<string, string> = {
        nouvelle: 'Nouvelle', confirmee: 'Confirmée', expediee: 'Expédiée',
        livree: 'Livrée', annulee: 'Annulée',
      };
      setStatusData(
        Object.entries(statusCounts).map(([k, v]) => ({ name: labels[k] ?? k, value: v })),
      );
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  const cards = [
    { label: 'Commandes', value: stats.orders, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: "Chiffre d'affaires", value: formatPrice(stats.revenue), icon: Euro, color: 'bg-green-500' },
    { label: 'Produits', value: stats.products, icon: Package, color: 'bg-purple-500' },
    { label: 'Clients', value: stats.customers, icon: Users, color: 'bg-amber-500' },
  ];

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#a855f7', '#22c55e', '#ef4444'];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-500">{c.label}</p>
                <p className="mt-2 text-2xl font-bold">{c.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color} text-white`}>
                <c.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Commandes (7 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ececee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#0d0d10" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Statut des commandes</h2>
          {statusData.length === 0 ? (
            <p className="text-sm text-ink-500">Aucune commande</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-ink-900"
        >
          <TrendingUp className="h-4 w-4" /> Voir toutes les commandes
        </Link>
      </div>
    </div>
  );
}
