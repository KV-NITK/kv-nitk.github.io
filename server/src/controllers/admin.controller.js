import { listAllOrders } from "../services/admin.service.js";

export const listOrdersController = async (req, res) => {
  try {
    const orders = await listAllOrders();

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("List admin orders controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
