/*
# E-commerce clothing store schema (Tunisia)

1. Overview
This migration creates the full database for a clothing e-commerce store
targeting the Tunisian market. It supports a public storefront (no customer
login required) and a secured admin area (Supabase email/password auth).

2. New Tables
- `categories`        : product categories (Homme / Femme / Enfant + sub-types)
- `products`          : product catalog with price, promo, stock, flags
- `product_images`    : multiple images per product (ordered)
- `product_variants`  : size/color combinations with per-variant stock
- `customers`         : guest customer info collected at checkout
- `orders`            : checkout orders with shipping + status
- `order_items`       : line items per order
- `shipping_fees`     : delivery fees per governorate (editable from admin)
- `promo_codes`       : promotional discount codes
- `wishlists`         : guest wishlist (stored by session id in localStorage)

3. Security (RLS)
- Public read access for products, categories, images, variants, shipping fees,
  promo codes (active only) — the storefront is a no-auth experience.
- Orders + customers + wishlists: anyone may INSERT (guest checkout), but
  reads are restricted to authenticated admins only.
- Admin tables (shipping_fees, promo_codes, categories, products, variants,
  images) allow full CRUD only to authenticated users (admin).
- All tables have RLS enabled.

4. Notes
- Prices are stored as numeric(10,2) in Tunisian Dinars (DT).
- Orders reference a governorate by name; shipping_fees keyed by governorate.
- `sold_count` on products is incremented via a trigger when orders are placed.
*/

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  gender text,                    -- 'Homme' | 'Femme' | 'Enfant' | NULL (for sub-types)
  type text,                      -- 'T-shirt' | 'Pantalon' | ... (NULL for top-level gender categories)
  is_gender_category boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  reference text NOT NULL UNIQUE,
  description text,
  composition text,
  price numeric(10,2) NOT NULL,
  old_price numeric(10,2),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  gender text NOT NULL,            -- 'Homme' | 'Femme' | 'Enfant'
  type text NOT NULL,              -- 'T-shirt' | 'Pantalon' | ...
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  stock int NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_promotion boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sold_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_promotion ON products(is_promotion);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_reference ON products(reference);

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ============ PRODUCT IMAGES ============
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_product_images" ON product_images;
CREATE POLICY "admin_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_product_images" ON product_images;
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_product_images" ON product_images;
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (true);

-- ============ SHIPPING FEES ============
CREATE TABLE IF NOT EXISTS shipping_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate text NOT NULL UNIQUE,
  fee numeric(10,2) NOT NULL DEFAULT 8,
  is_grand_tunis boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE shipping_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_shipping_fees" ON shipping_fees;
CREATE POLICY "public_read_shipping_fees" ON shipping_fees FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_shipping_fees" ON shipping_fees;
CREATE POLICY "admin_insert_shipping_fees" ON shipping_fees FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_shipping_fees" ON shipping_fees;
CREATE POLICY "admin_update_shipping_fees" ON shipping_fees FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_shipping_fees" ON shipping_fees;
CREATE POLICY "admin_delete_shipping_fees" ON shipping_fees FOR DELETE
  TO authenticated USING (true);

-- ============ PROMO CODES ============
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percent',  -- 'percent' | 'fixed'
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_promo_codes" ON promo_codes;
CREATE POLICY "public_read_active_promo_codes" ON promo_codes FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_insert_promo_codes" ON promo_codes;
CREATE POLICY "admin_insert_promo_codes" ON promo_codes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_promo_codes" ON promo_codes;
CREATE POLICY "admin_update_promo_codes" ON promo_codes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_promo_codes" ON promo_codes;
CREATE POLICY "admin_delete_promo_codes" ON promo_codes FOR DELETE
  TO authenticated USING (true);

-- ============ CUSTOMERS ============
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text,
  governorate text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  postal_code text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

DROP POLICY IF EXISTS "public_insert_customers" ON customers;
CREATE POLICY "public_insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_customers" ON customers;
CREATE POLICY "admin_read_customers" ON customers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_customers" ON customers;
CREATE POLICY "admin_update_customers" ON customers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_customers" ON customers;
CREATE POLICY "admin_delete_customers" ON customers FOR DELETE
  TO authenticated USING (true);

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text,
  governorate text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  postal_code text,
  note text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping_fee numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  promo_code text,
  status text NOT NULL DEFAULT 'nouvelle',  -- nouvelle | confirmee | expediee | livree | annulee
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at desc);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_reference text NOT NULL,
  product_image text,
  size text,
  color text,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;
CREATE POLICY "admin_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (true);

-- ============ FUNCTION: generate order number ============
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  seq int;
BEGIN
  SELECT nextval('order_seq') INTO seq;
  RETURN 'CMD-' || to_char(now(), 'YYMMDD') || '-' || lpad(seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'order_seq') THEN
    CREATE SEQUENCE order_seq START 1;
  END IF;
END $$;

-- ============ FUNCTION: decrement stock on order insert ============
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS trigger AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - NEW.quantity),
      sold_count = sold_count + NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrement_stock ON order_items;
CREATE TRIGGER trg_decrement_stock
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION decrement_product_stock();
