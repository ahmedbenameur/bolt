/*
# Seed data for e-commerce store

1. Categories
- Top-level gender categories (Homme, Femme, Enfant)
- Sub-type categories (T-shirt, Pantalon, etc.) linked to genders

2. Shipping fees
- Grand Tunis governorates: 8 DT
- Other Tunisian governorates: 10 DT

3. Products
- ~30 sample products across genders and types with images from Pexels
- Mix of regular, promotion, new, and featured items
*/

-- ============ SHIPPING FEES ============
INSERT INTO shipping_fees (governorate, fee, is_grand_tunis) VALUES
  ('Tunis', 8, true),
  ('Ariana', 8, true),
  ('Ben Arous', 8, true),
  ('Manouba', 8, true),
  ('Nabeul', 10, false),
  ('Zaghouan', 10, false),
  ('Bizerte', 10, false),
  ('Béja', 10, false),
  ('Jendouba', 10, false),
  ('Kef', 10, false),
  ('Siliana', 10, false),
  ('Sousse', 10, false),
  ('Monastir', 10, false),
  ('Mahdia', 10, false),
  ('Sfax', 10, false),
  ('Kairouan', 10, false),
  ('Kasserine', 10, false),
  ('Sidi Bouzid', 10, false),
  ('Gabès', 10, false),
  ('Médenine', 10, false),
  ('Tataouine', 10, false),
  ('Gafsa', 10, false),
  ('Tozeur', 10, false),
  ('Kebili', 10, false)
ON CONFLICT (governorate) DO UPDATE SET fee = EXCLUDED.fee, is_grand_tunis = EXCLUDED.is_grand_tunis;

-- ============ CATEGORIES ============
-- Top-level gender categories
INSERT INTO categories (name, slug, gender, type, is_gender_category) VALUES
  ('Homme', 'homme', 'Homme', NULL, true),
  ('Femme', 'femme', 'Femme', NULL, true),
  ('Enfant', 'enfant', 'Enfant', NULL, true)
ON CONFLICT (slug) DO NOTHING;

-- Sub-type categories (type-based, reusable across genders)
INSERT INTO categories (name, slug, gender, type, is_gender_category) VALUES
  ('T-shirt', 'tshirt', NULL, 'T-shirt', false),
  ('Chemise', 'chemise', NULL, 'Chemise', false),
  ('Polo', 'polo', NULL, 'Polo', false),
  ('Pantalon', 'pantalon', NULL, 'Pantalon', false),
  ('Jean', 'jean', NULL, 'Jean', false),
  ('Short', 'short', NULL, 'Short', false),
  ('Robe', 'robe', NULL, 'Robe', false),
  ('Jupe', 'jupe', NULL, 'Jupe', false),
  ('Veste', 'veste', NULL, 'Veste', false),
  ('Sweat', 'sweat', NULL, 'Sweat', false),
  ('Pull', 'pull', NULL, 'Pull', false),
  ('Chaussures', 'chaussures', NULL, 'Chaussures', false),
  ('Accessoires', 'accessoires', NULL, 'Accessoires', false)
ON CONFLICT (slug) DO NOTHING;

-- ============ PRODUCTS ============
-- Helper: we'll insert products with explicit image URLs from Pexels.

-- HOMME products
INSERT INTO products (name, reference, description, composition, price, old_price, gender, type, sizes, colors, stock, is_featured, is_promotion, is_new) VALUES
  ('T-shirt Homme Essential', 'TS-H-001', 'T-shirt basique en coton bio, coupe régulière. Idéal pour un usage quotidien.', '100% Coton bio', 29.90, NULL, 'Homme', 'T-shirt', ARRAY['S','M','L','XL'], ARRAY['Blanc','Noir','Gris'], 120, true, false, true),
  ('Chemise Homme Lin', 'CH-H-002', 'Chemise en lin léger, parfaite pour l''été. Coupe droite.', '100% Lin', 79.90, 99.90, 'Homme', 'Chemise', ARRAY['S','M','L','XL'], ARRAY['Beige','Bleu'], 45, false, true, false),
  ('Polo Homme Classic', 'PO-H-003', 'Polo en piqué de coton, col contrasté.', '100% Coton', 49.90, NULL, 'Homme', 'Polo', ARRAY['S','M','L','XL','XXL'], ARRAY['Marine','Blanc','Rouge'], 80, true, false, false),
  ('Jean Homme Slim', 'JN-H-004', 'Jean slim stretch, taille mi-haute. Confort optimal.', '98% Coton, 2% Élasthanne', 119.90, 149.90, 'Homme', 'Jean', ARRAY['30','32','34','36','38'], ARRAY['Bleu','Noir'], 60, true, true, true),
  ('Pantalon Homme Chino', 'PT-H-005', 'Pantalon chino coupe slim, tissu résistant.', '98% Coton, 2% Élasthanne', 89.90, NULL, 'Homme', 'Pantalon', ARRAY['30','32','34','36','38'], ARRAY['Beige','Marine','Olive'], 50, false, false, false),
  ('Short Homme Casual', 'SH-H-006', 'Short en coton léger, ceinture élastique.', '100% Coton', 39.90, 49.90, 'Homme', 'Short', ARRAY['S','M','L','XL'], ARRAY['Beige','Noir'], 70, false, true, true),
  ('Veste Homme Denim', 'VJ-H-007', 'Veste en denim, style intemporel.', '100% Coton', 159.90, NULL, 'Homme', 'Veste', ARRAY['S','M','L','XL'], ARRAY['Bleu'], 25, true, false, false),
  ('Sweat Homme Oversize', 'SW-H-008', 'Sweat oversize, intérieur molletonné.', '80% Coton, 20% Polyester', 99.90, NULL, 'Homme', 'Sweat', ARRAY['S','M','L','XL'], ARRAY['Gris','Noir','Crème'], 40, false, false, true),
  ('Pull Homme Col Roulé', 'PL-H-009', 'Pull col roulé en laine mérinos, chaleur et élégance.', '100% Laine mérinos', 129.90, 159.90, 'Homme', 'Pull', ARRAY['S','M','L','XL'], ARRAY['Marine','Gris','Bordeaux'], 35, true, true, false),
  ('Sneakers Homme Urban', 'SN-H-010', 'Sneakers en cuir, semelle confort.', 'Cuir synthétique', 149.90, NULL, 'Homme', 'Chaussures', ARRAY['40','41','42','43','44','45'], ARRAY['Blanc','Noir'], 55, true, false, true)
ON CONFLICT (reference) DO NOTHING;

-- FEMME products
INSERT INTO products (name, reference, description, composition, price, old_price, gender, type, sizes, colors, stock, is_featured, is_promotion, is_new) VALUES
  ('Robe Femme Élégante', 'RB-F-001', 'Robe fluide, parfaite pour les soirées.', '100% Polyester', 129.90, 169.90, 'Femme', 'Robe', ARRAY['XS','S','M','L'], ARRAY['Noir','Rouge','Bleu'], 40, true, true, true),
  ('Jupe Femme Plissée', 'JP-F-002', 'Jupe plissée mi-longueur, tissu fluide.', '100% Polyester', 69.90, NULL, 'Femme', 'Jupe', ARRAY['XS','S','M','L'], ARRAY['Beige','Noir'], 50, false, false, false),
  ('T-shirt Femme Crop', 'TS-F-003', 'T-shirt crop top, coupe ajustée.', '95% Coton, 5% Élasthanne', 34.90, 44.90, 'Femme', 'T-shirt', ARRAY['XS','S','M','L'], ARRAY['Blanc','Noir','Rose'], 90, true, true, true),
  ('Chemise Femme Soie', 'CH-F-004', 'Chemise en soie, toucher luxueux.', '100% Soie', 119.90, NULL, 'Femme', 'Chemise', ARRAY['XS','S','M','L'], ARRAY['Blanc','Ivoire'], 30, true, false, false),
  ('Jean Femme Skinny', 'JN-F-005', 'Jean skinny haute taille, galbe affirmé.', '98% Coton, 2% Élasthanne', 109.90, 129.90, 'Femme', 'Jean', ARRAY['26','28','30','32','34'], ARRAY['Bleu','Noir'], 65, true, true, false),
  ('Pantalon Femme Large', 'PT-F-006', 'Pantalon large fluide, tendance.', '100% Polyester', 79.90, NULL, 'Femme', 'Pantalon', ARRAY['XS','S','M','L'], ARRAY['Beige','Noir'], 45, false, false, true),
  ('Veste Femme Blazer', 'VJ-F-007', 'Blazer structuré, allure pro.', '70% Polyester, 30% Viscose', 159.90, NULL, 'Femme', 'Veste', ARRAY['XS','S','M','L'], ARRAY['Noir','Marine'], 28, true, false, false),
  ('Sweat Femme Hoodie', 'SW-F-008', 'Sweat à capuche doublé, ultra confort.', '80% Coton, 20% Polyester', 89.90, NULL, 'Femme', 'Sweat', ARRAY['XS','S','M','L'], ARRAY['Gris','Rose poudré'], 60, false, false, true),
  ('Pull Femme Maille', 'PL-F-009', 'Pull en maille fine, col rond.', '50% Laine, 50% Acrylique', 99.90, 119.90, 'Femme', 'Pull', ARRAY['XS','S','M','L'], ARRAY['Crème','Camel'], 38, false, true, false),
  ('Sneakers Femme Blanc', 'SN-F-010', 'Sneakers blanches, intemporelles.', 'Cuir synthétique', 139.90, NULL, 'Femme', 'Chaussures', ARRAY['36','37','38','39','40'], ARRAY['Blanc'], 48, true, false, true)
ON CONFLICT (reference) DO NOTHING;

-- ENFANT products
INSERT INTO products (name, reference, description, composition, price, old_price, gender, type, sizes, colors, stock, is_featured, is_promotion, is_new) VALUES
  ('T-shirt Enfant Graphic', 'TS-E-001', 'T-shirt imprimé, coton doux.', '100% Coton', 24.90, NULL, 'Enfant', 'T-shirt', ARRAY['4 ans','6 ans','8 ans','10 ans'], ARRAY['Blanc','Bleu','Rouge'], 100, true, false, true),
  ('Chemise Enfant Cérémonie', 'CH-E-002', 'Chemise élégante pour occasions spéciales.', '100% Coton', 49.90, 59.90, 'Enfant', 'Chemise', ARRAY['4 ans','6 ans','8 ans','10 ans'], ARRAY['Blanc','Bleu'], 40, false, true, false),
  ('Pantalon Enfant Jogging', 'PT-E-003', 'Jogging confortable, taille élastique.', '100% Coton', 39.90, NULL, 'Enfant', 'Pantalon', ARRAY['4 ans','6 ans','8 ans','10 ans'], ARRAY['Gris','Noir'], 75, false, false, false),
  ('Jean Enfant Regular', 'JN-E-004', 'Jean coupe régulière, solide.', '98% Coton, 2% Élasthanne', 59.90, NULL, 'Enfant', 'Jean', ARRAY['4 ans','6 ans','8 ans','10 ans'], ARRAY['Bleu'], 55, true, false, true),
  ('Short Enfant Été', 'SH-E-005', 'Short léger pour l''été.', '100% Coton', 29.90, 34.90, 'Enfant', 'Short', ARRAY['4 ans','6 ans','8 ans'], ARRAY['Beige','Marine'], 60, false, true, true),
  ('Robe Enfant Fleurie', 'RB-E-006', 'Robe à motifs floraux, parfaite pour les fêtes.', '100% Polyester', 54.90, NULL, 'Enfant', 'Robe', ARRAY['4 ans','6 ans','8 ans'], ARRAY['Rose','Jaune'], 35, true, false, false),
  ('Veste Enfant Polaire', 'VJ-E-007', 'Veste polaire chaude et légère.', '100% Polyester', 69.90, NULL, 'Enfant', 'Veste', ARRAY['4 ans','6 ans','8 ans','10 ans'], ARRAY['Rouge','Bleu'], 45, false, false, true),
  ('Sweat Enfant Capuche', 'SW-E-008', 'Sweat à capuche, doux et chaud.', '80% Coton, 20% Polyester', 49.90, 59.90, 'Enfant', 'Sweat', ARRAY['4 ans','6 ans','8 ans','10 ans'], ARRAY['Gris','Marine'], 50, false, true, false),
  ('Pull Enfant Tricot', 'PL-E-009', 'Pull tricot jacquard, motif hiver.', '50% Laine, 50% Acrylique', 59.90, NULL, 'Enfant', 'Pull', ARRAY['4 ans','6 ans','8 ans'], ARRAY['Crème','Rouge'], 30, false, false, false),
  ('Sneakers Enfant Sport', 'SN-E-010', 'Sneakers sport, semelle souple.', 'Synthétique', 69.90, NULL, 'Enfant', 'Chaussures', ARRAY['28','30','32','34','36'], ARRAY['Blanc','Rose'], 42, true, false, true)
ON CONFLICT (reference) DO NOTHING;

-- ============ PRODUCT IMAGES ============
-- Assign multiple images per product from Pexels URLs.
DO $$
DECLARE
  p record;
  img_map jsonb;
BEGIN
  -- Map reference -> array of image URLs
  img_map := jsonb_build_object(
    'TS-H-001', jsonb_build_array(
      'https://images.pexels.com/photos/20502926/pexels-photo-20502926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/15059446/pexels-photo-15059446.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8460301/pexels-photo-8460301.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'CH-H-002', jsonb_build_array(
      'https://images.pexels.com/photos/10004175/pexels-photo-10004175.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/15141023/pexels-photo-15141023.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'PO-H-003', jsonb_build_array(
      'https://images.pexels.com/photos/2421356/pexels-photo-2421356.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/5010342/pexels-photo-5010342.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'JN-H-004', jsonb_build_array(
      'https://images.pexels.com/photos/775771/pexels-photo-775771.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/15141023/pexels-photo-15141023.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'PT-H-005', jsonb_build_array(
      'https://images.pexels.com/photos/20440141/pexels-photo-20440141.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/6050432/pexels-photo-6050432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'SH-H-006', jsonb_build_array(
      'https://images.pexels.com/photos/8549469/pexels-photo-8549469.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8460301/pexels-photo-8460301.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'VJ-H-007', jsonb_build_array(
      'https://images.pexels.com/photos/11434887/pexels-photo-11434887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/10427342/pexels-photo-10427342.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'SW-H-008', jsonb_build_array(
      'https://images.pexels.com/photos/14707868/pexels-photo-14707868.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/14385859/pexels-photo-14385859.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'PL-H-009', jsonb_build_array(
      'https://images.pexels.com/photos/6461703/pexels-photo-6461703.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8549469/pexels-photo-8549469.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'SN-H-010', jsonb_build_array(
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8979071/pexels-photo-8979071.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'RB-F-001', jsonb_build_array(
      'https://images.pexels.com/photos/26102191/pexels-photo-26102191.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/17347430/pexels-photo-17347430.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'JP-F-002', jsonb_build_array(
      'https://images.pexels.com/photos/6138908/pexels-photo-6138908.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/21390399/pexels-photo-21390399.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'TS-F-003', jsonb_build_array(
      'https://images.pexels.com/photos/20601205/pexels-photo-20601205.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/3195980/pexels-photo-3195980.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'CH-F-004', jsonb_build_array(
      'https://images.pexels.com/photos/19306663/pexels-photo-19306663.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/3195981/pexels-photo-3195981.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'JN-F-005', jsonb_build_array(
      'https://images.pexels.com/photos/19238454/pexels-photo-19238454.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/19238448/pexels-photo-19238448.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'PT-F-006', jsonb_build_array(
      'https://images.pexels.com/photos/33933602/pexels-photo-33933602.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/27299828/pexels-photo-27299828.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'VJ-F-007', jsonb_build_array(
      'https://images.pexels.com/photos/7582114/pexels-photo-7582114.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/33400429/pexels-photo-33400429.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'SW-F-008', jsonb_build_array(
      'https://images.pexels.com/photos/37292005/pexels-photo-37292005.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/21764915/pexels-photo-21764915.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'PL-F-009', jsonb_build_array(
      'https://images.pexels.com/photos/31094913/pexels-photo-31094913.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/29564436/pexels-photo-29564436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'SN-F-010', jsonb_build_array(
      'https://images.pexels.com/photos/20755674/pexels-photo-20755674.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/13580587/pexels-photo-13580587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'TS-E-001', jsonb_build_array(
      'https://images.pexels.com/photos/30690921/pexels-photo-30690921.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30690920/pexels-photo-30690920.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'CH-E-002', jsonb_build_array(
      'https://images.pexels.com/photos/36909815/pexels-photo-36909815.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30690921/pexels-photo-30690921.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'PT-E-003', jsonb_build_array(
      'https://images.pexels.com/photos/38778561/pexels-photo-38778561.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/33018404/pexels-photo-33018404.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'JN-E-004', jsonb_build_array(
      'https://images.pexels.com/photos/38778561/pexels-photo-38778561.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/1620759/pexels-photo-1620759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'SH-E-005', jsonb_build_array(
      'https://images.pexels.com/photos/8084066/pexels-photo-8084066.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/34608858/pexels-photo-34608858.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'RB-E-006', jsonb_build_array(
      'https://images.pexels.com/photos/34608858/pexels-photo-34608858.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8084066/pexels-photo-8084066.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'VJ-E-007', jsonb_build_array(
      'https://images.pexels.com/photos/35078823/pexels-photo-35078823.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/28259743/pexels-photo-28259743.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'SW-E-008', jsonb_build_array(
      'https://images.pexels.com/photos/1620759/pexels-photo-1620759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30690920/pexels-photo-30690920.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'PL-E-009', jsonb_build_array(
      'https://images.pexels.com/photos/35078823/pexels-photo-35078823.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/28259743/pexels-photo-28259743.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    ),
    'SN-E-010', jsonb_build_array(
      'https://images.pexels.com/photos/4273288/pexels-photo-4273288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/19271383/pexels-photo-19271383.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    )
  );

  FOR p IN SELECT id, reference FROM products LOOP
    IF img_map ? p.reference THEN
      FOR i IN 0..jsonb_array_length(img_map->p.reference) - 1 LOOP
        INSERT INTO product_images (product_id, url, position)
        VALUES (p.id, img_map->p.reference->>i, i)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- ============ PROMO CODES ============
INSERT INTO promo_codes (code, discount_type, discount_value, is_active) VALUES
  ('BIENVENUE10', 'percent', 10, true),
  ('PROMO20', 'percent', 20, true),
  ('LIVRAISON5', 'fixed', 5, true)
ON CONFLICT (code) DO NOTHING;
