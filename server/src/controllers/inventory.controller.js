import { StaffError } from "../services/staff.service.js";
import { getInventory, setStock, addSpotSale, undoSpotSale } from "../services/inventory.service.js";
import { setStockSchema, spotSaleSchema, spotSaleIdParamSchema } from "../validators/inventory.validator.js";

const fail = (res, error, fallback) => {
  if (error instanceof StaffError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  console.error(fallback, error);

  return res.status(500).json({ success: false, message: fallback });
};

const invalid = (res, parsed) =>
  res.status(400).json({
    success: false,
    message: parsed.error.issues[0]?.message || "Invalid request",
  });

/** GET /api/admin/inventory */
export const getInventoryController = async (req, res) => {
  try {
    return res.json({ success: true, ...(await getInventory()) });
  } catch (error) {
    return fail(res, error, "Failed to load the inventory");
  }
};

/** PUT /api/admin/inventory   body: { items: [{ productId, stock }] } */
export const setStockController = async (req, res) => {
  const parsed = setStockSchema.safeParse(req.body ?? {});
  if (!parsed.success) return invalid(res, parsed);

  try {
    const inventory = await setStock(parsed.data.items);

    console.log("Merch stock updated:", parsed.data.items.map((i) => `${i.productId}=${i.stock}`).join(", "));

    return res.json({ success: true, ...inventory });
  } catch (error) {
    return fail(res, error, "Failed to save the stock");
  }
};

/** POST /api/admin/inventory/spot-sales   body: { productId, quantity?, studentName? } */
export const addSpotSaleController = async (req, res) => {
  const parsed = spotSaleSchema.safeParse(req.body ?? {});
  if (!parsed.success) return invalid(res, parsed);

  try {
    const inventory = await addSpotSale(parsed.data);

    console.log(`Spot sale: ${parsed.data.quantity} x ${parsed.data.productId}`);

    return res.status(201).json({ success: true, ...inventory });
  } catch (error) {
    return fail(res, error, "Failed to save the spot sale");
  }
};

/** POST /api/admin/inventory/spot-sales/:id/undo */
export const undoSpotSaleController = async (req, res) => {
  const id = spotSaleIdParamSchema.safeParse(req.params);
  if (!id.success) return invalid(res, id);

  try {
    const inventory = await undoSpotSale(id.data.id);

    console.log(`Spot sale undone: ${id.data.id}`);

    return res.json({ success: true, ...inventory });
  } catch (error) {
    return fail(res, error, "Failed to undo the spot sale");
  }
};
