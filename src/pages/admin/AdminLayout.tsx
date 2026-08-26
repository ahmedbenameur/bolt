import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Truck,
  Ticket,
  LogOut,
  Store,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Catégories', icon: Tags },
  { to: '/admin/shipping', label: 'Livraison', icon: Truck },
  { to: '/admin/promos', label: 'Codes promo', icon: Ticket },
];

export function AdminLayout() {
  const { signOut, session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    navigate('/admin', { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-ink-100 px-6">
          <Store className="h-6 w-6" />
          <span className="font-display text-lg font-bold">TUNISIA Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-700 hover:bg-ink-100',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 p-4">
          <button
            onClick={async () => {
              await signOut();
              navigate('/admin');
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 md:hidden">
          <span className="font-display text-lg font-bold">Admin</span>
          <div className="flex gap-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    isActive ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
              </NavLink>
            ))}
            <button
              onClick={async () => {
                await signOut();
                navigate('/admin');
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
