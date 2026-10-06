import { supabase } from "../config/supabase.js";

// PostgREST returns at most 1000 rows per request
const MAX_ORDERS = 1000;

// Every order, newest first, as the admin page needs it. The stored status
// only: nothing is asked of Cashfree, so an order whose webhook is late can
// still read Pending here.
export const listAllOrders = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, provider_order_id, user_iris_id, status, amount, subtotal_amount, discount_amount, coupon_code, items, customer_name, customer_email, customer_phone, failure_reason, created_at, paid_at"
    )
    .order("created_at", { ascending: false })
    .limit(MAX_ORDERS);

  if (error) {
    console.error("Failed to list all orders:", error);
    throw new Error("Failed to fetch orders");
  }

  return data.map((payment) => ({
    paymentId: payment.id,
    orderId: payment.provider_order_id,
    irisId: payment.user_iris_id,
    status: payment.status,
    amount: Number(payment.amount),
    subtotal: Number(payment.subtotal_amount ?? payment.amount),
    discount: Number(payment.discount_amount ?? 0),
    couponCode: payment.coupon_code ?? null,
    items: payment.items ?? [],
    name: payment.customer_name ?? null,
    email: payment.customer_email ?? null,
    phone: payment.customer_phone ?? null,
    failureReason: payment.failure_reason ?? null,
    createdAt: payment.created_at ?? null,
    paidAt: payment.paid_at ?? null,
  }));
};
