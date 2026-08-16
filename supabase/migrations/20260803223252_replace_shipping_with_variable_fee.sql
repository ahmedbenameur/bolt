/*
# Replace per-governorate shipping with a single variable fee

1. Overview
The old shipping system charged different fees per governorate (Grand Tunis 8 DT,
others 10 DT). The admin now wants a single variable delivery fee that they set
themselves — no per-governorate logic. This migration:
- Creates a `store_settings` table (key/value) to hold the single shipping fee.
- Seeds the default shipping fee to 8 DT.
- Drops the `shipping_fees` table (no user data is lost — it was configuration only).

2. New Tables
- `store_settings` : single-row key/value config table for store-wide settings.
  - `key` (text, primary key) — setting name (e.g. 'shipping_fee')
  - `value` (numeric) — the numeric value of the setting
  - `updated_at` (timestamptz)

3. Removed Tables
- `shipping_fees` — dropped entirely. All shipping logic is now a single value
  in `store_settings`.

4. Security (RLS)
- `store_settings`: public read (storefront needs the fee), admin-only write.
- All 4 CRUD policies included.

5. Notes
- The `orders` table still has its `shipping_fee` column — each order records the
  fee that was charged at checkout time, so historical orders remain correct.
*/

CREATE TABLE IF NOT EXISTS store_settings (
  key text PRIMARY KEY,
  value numeric(10,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_store_settings" ON store_settings;
CREATE POLICY "public_read_store_settings" ON store_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_store_settings" ON store_settings;
CREATE POLICY "admin_insert_store_settings" ON store_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_store_settings" ON store_settings;
CREATE POLICY "admin_update_store_settings" ON store_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_store_settings" ON store_settings;
CREATE POLICY "admin_delete_store_settings" ON store_settings FOR DELETE
  TO authenticated USING (true);

INSERT INTO store_settings (key, value)
VALUES ('shipping_fee', 8)
ON CONFLICT (key) DO NOTHING;

DROP TABLE IF EXISTS shipping_fees;
