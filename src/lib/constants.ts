export const GENDERS = ['Homme', 'Femme', 'Enfant'] as const;
export type Gender = (typeof GENDERS)[number];

export const PRODUCT_TYPES = [
  'T-shirt',
  'Chemise',
  'Polo',
  'Pantalon',
  'Jean',
  'Short',
  'Robe',
  'Jupe',
  'Veste',
  'Sweat',
  'Pull',
  'Chaussures',
  'Accessoires',
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const ORDER_STATUSES = [
  'nouvelle',
  'confirmee',
  'expediee',
  'livree',
  'annulee',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: 'Nouvelle',
  confirmee: 'Confirmée',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  nouvelle: 'bg-blue-100 text-blue-700',
  confirmee: 'bg-amber-100 text-amber-700',
  expediee: 'bg-purple-100 text-purple-700',
  livree: 'bg-green-100 text-green-700',
  annulee: 'bg-red-100 text-red-700',
};

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Les plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'best_selling', label: 'Les plus vendus' },
  { value: 'promotions', label: 'Promotions' },
] as const;

export const TUNISIAN_GOVERNORATES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
  'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 'Jendouba', 'Kef', 'Siliana',
  'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili',
];

export const DEFAULT_SHIPPING_FEE = 8;

export const STORAGE_KEYS = {
  cart: 'tunisia-cart',
  wishlist: 'tunisia-wishlist',
  recentlyViewed: 'tunisia-recently-viewed',
};

export const STORE_NAME = 'TUNISIA';
export const STORE_TAGLINE = 'Mode & Élégance';
