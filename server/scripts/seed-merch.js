import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export const MERCH_PRODUCTS = [
  {
    id: "tshirt-a-xs",
    name: "T-Shirt A",
    category: "MERCH",
    group_key: "tshirt-a",
    fit: "Regular fit",
    variant: "XS",
    unit_price: 299.0,
    max_quantity: 5,
    sort_order: 0,
    active: true,
  },
  {
    id: "tshirt-a-s",
    name: "T-Shirt A",
    category: "MERCH",
    group_key: "tshirt-a",
    fit: "Regular fit",
    variant: "S",
    unit_price: 299.0,
    max_quantity: 5,
    sort_order: 1,
    active: true,
  },
  {
    id: "tshirt-a-m",
    name: "T-Shirt A",
    category: "MERCH",
    group_key: "tshirt-a",
    fit: "Regular fit",
    variant: "M",
    unit_price: 299.0,
    max_quantity: 5,
    sort_order: 2,
    active: true,
  },
  {
    id: "tshirt-a-l",
    name: "T-Shirt A",
    category: "MERCH",
    group_key: "tshirt-a",
    fit: "Regular fit",
    variant: "L",
    unit_price: 299.0,
    max_quantity: 5,
    sort_order: 3,
    active: true,
  },
  {
    id: "tshirt-a-xl",
    name: "T-Shirt A",
    category: "MERCH",
    group_key: "tshirt-a",
    fit: "Regular fit",
    variant: "XL",
    unit_price: 299.0,
    max_quantity: 5,
    sort_order: 4,
    active: true,
  },
  {
    id: "tshirt-a-xxl",
    name: "T-Shirt A",
    category: "MERCH",
    group_key: "tshirt-a",
    fit: "Regular fit",
    variant: "XXL",
    unit_price: 299.0,
    max_quantity: 5,
    sort_order: 5,
    active: true,
  },
  {
    id: "tshirt-b-xs",
    name: "T-Shirt B",
    category: "MERCH",
    group_key: "tshirt-b",
    fit: "Oversized",
    variant: "XS",
    unit_price: 349.0,
    max_quantity: 5,
    sort_order: 0,
    active: true,
  },
  {
    id: "tshirt-b-s",
    name: "T-Shirt B",
    category: "MERCH",
    group_key: "tshirt-b",
    fit: "Oversized",
    variant: "S",
    unit_price: 349.0,
    max_quantity: 5,
    sort_order: 1,
    active: true,
  },
  {
    id: "tshirt-b-m",
    name: "T-Shirt B",
    category: "MERCH",
    group_key: "tshirt-b",
    fit: "Oversized",
    variant: "M",
    unit_price: 349.0,
    max_quantity: 5,
    sort_order: 2,
    active: true,
  },
  {
    id: "tshirt-b-l",
    name: "T-Shirt B",
    category: "MERCH",
    group_key: "tshirt-b",
    fit: "Oversized",
    variant: "L",
    unit_price: 349.0,
    max_quantity: 5,
    sort_order: 3,
    active: true,
  },
  {
    id: "tshirt-b-xl",
    name: "T-Shirt B",
    category: "MERCH",
    group_key: "tshirt-b",
    fit: "Oversized",
    variant: "XL",
    unit_price: 349.0,
    max_quantity: 5,
    sort_order: 4,
    active: true,
  },
  {
    id: "tshirt-b-xxl",
    name: "T-Shirt B",
    category: "MERCH",
    group_key: "tshirt-b",
    fit: "Oversized",
    variant: "XXL",
    unit_price: 349.0,
    max_quantity: 5,
    sort_order: 5,
    active: true,
  },
];

async function seedMerch() {
  console.log("Seeding merchandise products from server/sql/seed_test_merch.sql...");

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration in environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("payment_products")
    .upsert(MERCH_PRODUCTS, { onConflict: "id" })
    .select();

  if (error) {
    console.error("Failed to seed merchandise products:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} merchandise products into payment_products.`);
}

seedMerch().catch((err) => {
  console.error(err);
  process.exit(1);
});
