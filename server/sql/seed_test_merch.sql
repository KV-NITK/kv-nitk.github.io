-- TEST DATA ONLY: two t-shirts x four sizes, one price per t-shirt.
-- Prices are placeholders; change them or replace these rows with the real merch.
-- Run after create_payment_catalog.sql.

INSERT INTO payment_products (id, name, category, group_key, variant, unit_price, max_quantity) VALUES
  ('tshirt-a-s',  'T-Shirt A', 'MERCH', 'tshirt-a', 'S',  299.00, 5),
  ('tshirt-a-m',  'T-Shirt A', 'MERCH', 'tshirt-a', 'M',  299.00, 5),
  ('tshirt-a-l',  'T-Shirt A', 'MERCH', 'tshirt-a', 'L',  299.00, 5),
  ('tshirt-a-xl', 'T-Shirt A', 'MERCH', 'tshirt-a', 'XL', 299.00, 5),
  ('tshirt-b-s',  'T-Shirt B', 'MERCH', 'tshirt-b', 'S',  349.00, 5),
  ('tshirt-b-m',  'T-Shirt B', 'MERCH', 'tshirt-b', 'M',  349.00, 5),
  ('tshirt-b-l',  'T-Shirt B', 'MERCH', 'tshirt-b', 'L',  349.00, 5),
  ('tshirt-b-xl', 'T-Shirt B', 'MERCH', 'tshirt-b', 'XL', 349.00, 5)
ON CONFLICT (id) DO NOTHING;
