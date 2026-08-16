import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton, Spinner } from '@/components/ui/Spinner';
import { GENDERS, PRODUCT_TYPES, SORT_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

export function CataloguePage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const gender = params.get('gender') ?? '';
  const type = params.get('type') ?? '';
  const search = params.get('search') ?? '';
  const promo = params.get('promo') === '1';
  const sort = params.get('sort') ?? 'recent';
  const minPrice = params.get('minPrice') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const sizesParam = params.get('sizes') ?? '';
  const colorsParam = params.get('colors') ?? '';
  const availableOnly = params.get('available') === '1';

  const sizes = useMemo(() => (sizesParam ? sizesParam.split(',') : []), [sizesParam]);
  const colors = useMemo(() => (colorsParam ? colorsParam.split(',') : []), [colorsParam]);

  const allSizes = useMemo(
    () => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '40', '41', '42', '43', '44', '45'],
    [],
  );
  const allColors = useMemo(
    () => ['Blanc', 'Noir', 'Gris', 'Beige', 'Bleu', 'Marine', 'Rouge', 'Rose', 'Vert', 'Olive', 'Bordeaux', 'Crème', 'Camel', 'Jaune', 'Ivoire', 'Rose poudré'],
    [],
  );

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setPage(1);
  };

  const toggleArrayParam = (key: string, value: string) => {
    const current = params.get(key);
    const arr = current ? current.split(',') : [];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    updateParam(key, next.join(','));
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      gender: gender || undefined,
      type: type || undefined,
      search: search || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sizes,
      colors,
      promotionOnly: promo,
      availableOnly,
      sort,
      page,
      limit: PAGE_SIZE,
    })
      .then(({ data, total }) => {
        setProducts(data);
        setTotal(total);
      })
      .finally(() => setLoading(false));
  }, [gender, type, search, promo, sort, minPrice, maxPrice, sizesParam, colorsParam, availableOnly, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const title = search
    ? `Résultats pour "${search}"`
    : gender && type
      ? `${gender} · ${type}`
      : gender
        ? gender
        : type
          ? type
          : promo
            ? 'Promotions'
            : 'Tous les produits';

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-ink-500">{total} produit{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <aside
          className={cn(
            'lg:w-64 lg:shrink-0',
            showFilters
              ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-6 lg:static lg:z-auto lg:overflow-visible lg:p-0'
              : 'hidden lg:block',
          )}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <h2 className="text-lg font-semibold">Filtres</h2>
            <button onClick={() => setShowFilters(false)} aria-label="Fermer">
              <X className="h-6 w-6" />
            </button>
          </div>

          <FilterGroup title="Sexe">
            {GENDERS.map((g) => (
              <FilterRadio
                key={g}
                label={g}
                checked={gender === g}
                onChange={() => updateParam('gender', gender === g ? '' : g)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Type">
            {PRODUCT_TYPES.map((t) => (
              <FilterRadio
                key={t}
                label={t}
                checked={type === t}
                onChange={() => updateParam('type', type === t ? '' : t)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Taille">
            <div className="flex flex-wrap gap-2">
              {allSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleArrayParam('sizes', s)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition',
                    sizes.includes(s)
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 text-ink-700 hover:border-ink-400',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Couleur">
            <div className="flex flex-wrap gap-2">
              {allColors.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleArrayParam('colors', c)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition',
                    colors.includes(c)
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 text-ink-700 hover:border-ink-400',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Prix (DT)">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="input py-2"
              />
              <span className="text-ink-400">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="input py-2"
              />
            </div>
          </FilterGroup>

          <FilterGroup title="Filtres">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={promo}
                onChange={(e) => updateParam('promo', e.target.checked ? '1' : '')}
                className="h-4 w-4 accent-ink-900"
              />
              Promotion uniquement
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => updateParam('available', e.target.checked ? '1' : '')}
                className="h-4 w-4 accent-ink-900"
              />
              Disponible uniquement
            </label>
          </FilterGroup>

          <button
            onClick={() => setParams(new URLSearchParams(), { replace: true })}
            className="mt-4 w-full rounded-lg border border-ink-200 py-2 text-xs font-medium uppercase tracking-wide text-ink-600 hover:bg-ink-100"
          >
            Réinitialiser
          </button>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 text-sm font-medium text-ink-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filtres
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-ink-500 sm:inline">Trier par:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-ink-900"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="flex h-[40vh] flex-col items-center justify-center text-center">
              <p className="text-lg font-medium text-ink-700">Aucun produit trouvé</p>
              <p className="mt-1 text-sm text-ink-500">Essayez de modifier vos filtres.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-ink-200 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={cn(
                        'h-9 w-9 rounded-lg text-sm font-medium transition',
                        page === i + 1
                          ? 'bg-ink-900 text-white'
                          : 'border border-ink-200 text-ink-700 hover:bg-ink-100',
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-ink-200 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink-100 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-600">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterRadio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-ink-900"
      />
      {label}
    </label>
  );
}
