import { supabase } from '@/lib/supabase';
import type { Product, ProductImage } from '@/lib/types';

export async function fetchProducts(opts?: {
  gender?: string;
  type?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  promotionOnly?: boolean;
  availableOnly?: boolean;
  sort?: string;
  limit?: number;
  page?: number;
}): Promise<{ data: Product[]; total: number }> {
  let query = supabase
    .from('products')
    .select('*, product_images(*)', { count: 'exact' })
    .eq('is_active', true);

  if (opts?.gender) query = query.eq('gender', opts.gender);
  if (opts?.type) query = query.eq('type', opts.type);
  if (opts?.search) {
    query = query.or(`name.ilike.%${opts.search}%,reference.ilike.%${opts.search}%`);
  }
  if (opts?.minPrice != null) query = query.gte('price', opts.minPrice);
  if (opts?.maxPrice != null) query = query.lte('price', opts.maxPrice);
  if (opts?.promotionOnly) query = query.eq('is_promotion', true);
  if (opts?.availableOnly) query = query.gt('stock', 0);
  if (opts?.sizes?.length) query = query.overlaps('sizes', opts.sizes);
  if (opts?.colors?.length) query = query.overlaps('colors', opts.colors);

  switch (opts?.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'best_selling':
      query = query.order('sold_count', { ascending: false });
      break;
    case 'promotions':
      query = query.order('is_promotion', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const limit = opts?.limit ?? 12;
  const page = opts?.page ?? 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data as Product[]) ?? [], total: count ?? 0 };
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function fetchSimilarProducts(product: Product, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .eq('gender', product.gender)
    .eq('type', product.type)
    .neq('id', product.id)
    .limit(limit);
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit);
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function fetchNewProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function fetchPromoProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .eq('is_promotion', true)
    .limit(limit);
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .in('id', ids);
  if (error) throw error;
  const products = (data as Product[]) ?? [];
  // preserve order of input ids
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

export function getMainImage(product: Product): string {
  if (product.product_images && product.product_images.length > 0) {
    const sorted = [...product.product_images].sort((a, b) => a.position - b.position);
    return sorted[0].url;
  }
  return 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
}

export function getImages(product: Product): ProductImage[] {
  if (!product.product_images?.length) return [];
  return [...product.product_images].sort((a, b) => a.position - b.position);
}
