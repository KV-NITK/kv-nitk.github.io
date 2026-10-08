import { shirtName } from "@/lib/shirtName";

export const rupees = (n) => `₹${Number(n).toFixed(2)}`;

// "Regular T-shirt (M) × 2". Older orders have no stored variant, so fall back to the id suffix.
export const itemLabel = (it) => {
  const isFood = it.category === 'FOOD' || it.productId.startsWith('bhoori');
  const variant = it.variant || (!isFood && it.productId.includes("-") ? it.productId.split("-").pop().toUpperCase() : "");
  const name = isFood ? it.name : shirtName(it.productId, it.name);
  return `${name}${variant ? ` (${variant})` : ""} × ${it.quantity}`;
};

export const STATUS_STYLES = {
  SUCCESS: { label: "Paid", className: "bg-green-100 text-green-800" },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  CREATED: { label: "Not paid", className: "bg-neutral-200 text-neutral-700" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

// The discount of an order, as [{ label, amount }]: the coupon's part and the
// free goodie's. A fresh quote says the two parts itself. A saved order has one
// discount number, and what is in it depends on when it was saved:
//   - now: the goodie is in the subtotal and its price is part of the discount,
//   - just before: only the coupon was in the discount, and the subtotal left
//     the free goodie out,
//   - before that: the goodie was a paid line and has no discount.
// So the goodie is only taken out of the discount when the subtotal counts it.
export const discountParts = ({ items = [], subtotal, discount = 0, couponCode = null, couponDiscount, goodieDiscount }) => {
  let coupon = couponDiscount;
  let goodie = goodieDiscount;

  if (coupon === undefined) {
    goodie = items.find((it) => it.productId === "goodie")?.discount ?? 0;
    const listed = items.reduce((n, it) => n + Number(it.lineTotal || 0), 0);
    const goodieInDiscount = goodie > 0 && Math.abs(Number(subtotal) - listed) < 0.005;
    coupon = Math.round((discount - (goodieInDiscount ? goodie : 0)) * 100) / 100;
  }

  return [
    coupon > 0 && { label: couponCode ? `Coupon ${couponCode}` : "Discount", amount: coupon },
    goodie > 0 && { label: "Goodie (free)", amount: goodie },
  ].filter(Boolean);
};
