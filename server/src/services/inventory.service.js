import { supabase } from "../config/supabase.js";
import { StaffError } from "./staff.service.js";

// The functions or tables are missing: sql/008_merch_inventory.sql has not been run
const isMissingSetup = (error) =>
  ["42883", "42P01", "PGRST202", "PGRST205"].includes(error?.code) ||
  /does not exist|could not find/i.test(error?.message || "");

const NOT_SET_UP = "Inventory is not set up yet. Run sql/008_merch_inventory.sql on the database.";

// Messages raised by the database functions in 008_merch_inventory.sql
const KNOWN_ERRORS = {
  UNKNOWN_PRODUCT: [400, "Unknown product. Refresh and try again."],
  ALREADY_UNDONE: [409, "This spot sale was already undone."],
  SPOT_SALE_NOT_FOUND: [404, "Spot sale not found."],
};

const toInventory = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  unmatched: {
    claimed: Number(data?.unmatched?.claimed) || 0,
    toCollect: Number(data?.unmatched?.toCollect) || 0,
  },
  spotSales: Array.isArray(data?.spotSales) ? data.spotSales : [],
});

const callInventory = async (fn, args, failMessage) => {
  const { data, error } = await supabase.rpc(fn, args);

  if (error) {
    const known = KNOWN_ERRORS[error.message];
    if (known) throw new StaffError(known[0], known[1]);
    if (isMissingSetup(error)) throw new StaffError(503, NOT_SET_UP);

    console.error(`${fn} error:`, error);
    throw new StaffError(500, failMessage);
  }

  return toInventory(data);
};

/** Stock, given (scanned + spot) and to collect for every merch product, plus recent spot sales. */
export const getInventory = () => callInventory("merch_inventory", undefined, "Failed to load the inventory");

/** items: [{ productId, stock }]. All or nothing. */
export const setStock = (items) =>
  callInventory("set_merch_stock", { p_items: items }, "Failed to save the stock");

export const addSpotSale = ({ productId, quantity, studentName }) =>
  callInventory(
    "add_merch_spot_sale",
    { p_product_id: productId, p_quantity: quantity, p_student_name: studentName ?? null },
    "Failed to save the spot sale"
  );

export const undoSpotSale = (id) =>
  callInventory("undo_merch_spot_sale", { p_id: id }, "Failed to undo the spot sale");
