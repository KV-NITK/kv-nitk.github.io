-- TEST DATA ONLY: two t-shirt designs (A regular fit, B oversized), one price
-- per design, in sizes XS to XXL. Prices are placeholders; change them or
-- replace these rows with the real merch.
-- Run after create_payment_catalog.sql.

INSERT INTO payment_products (id, name, category, group_key, fit, variant, unit_price, max_quantity, sort_order) VALUES
  ('tshirt-a-xs', 'T-Shirt A', 'MERCH', 'tshirt-a', 'Regular fit', 'XS', 299.00, 5, 0),
  ('tshirt-a-s', 'T-Shirt A', 'MERCH', 'tshirt-a', 'Regular fit', 'S', 299.00, 5, 1),
  ('tshirt-a-m', 'T-Shirt A', 'MERCH', 'tshirt-a', 'Regular fit', 'M', 299.00, 5, 2),
  ('tshirt-a-l', 'T-Shirt A', 'MERCH', 'tshirt-a', 'Regular fit', 'L', 299.00, 5, 3),
  ('tshirt-a-xl', 'T-Shirt A', 'MERCH', 'tshirt-a', 'Regular fit', 'XL', 299.00, 5, 4),
  ('tshirt-a-xxl', 'T-Shirt A', 'MERCH', 'tshirt-a', 'Regular fit', 'XXL', 299.00, 5, 5),
  ('tshirt-b-xs', 'T-Shirt B', 'MERCH', 'tshirt-b', 'Oversized', 'XS', 349.00, 5, 0),
  ('tshirt-b-s', 'T-Shirt B', 'MERCH', 'tshirt-b', 'Oversized', 'S', 349.00, 5, 1),
  ('tshirt-b-m', 'T-Shirt B', 'MERCH', 'tshirt-b', 'Oversized', 'M', 349.00, 5, 2),
  ('tshirt-b-l', 'T-Shirt B', 'MERCH', 'tshirt-b', 'Oversized', 'L', 349.00, 5, 3),
  ('tshirt-b-xl', 'T-Shirt B', 'MERCH', 'tshirt-b', 'Oversized', 'XL', 349.00, 5, 4),
  ('tshirt-b-xxl', 'T-Shirt B', 'MERCH', 'tshirt-b', 'Oversized', 'XXL', 349.00, 5, 5)
ON CONFLICT (id) DO UPDATE SET
  fit = EXCLUDED.fit,
  sort_order = EXCLUDED.sort_order;
