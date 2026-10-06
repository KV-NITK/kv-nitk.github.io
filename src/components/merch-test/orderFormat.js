import { shirtName } from "@/lib/shirtName";

export const rupees = (n) => `₹${Number(n).toFixed(2)}`;

// "Regular T-shirt (M) × 2". Older orders have no stored variant, so fall back to the id suffix.
export const itemLabel = (it) => {
  const variant = it.variant || (it.productId.includes("-") ? it.productId.split("-").pop().toUpperCase() : "");
  return `${shirtName(it.productId, it.name)}${variant ? ` (${variant})` : ""} × ${it.quantity}`;
};

export const STATUS_STYLES = {
  SUCCESS: { label: "Paid", className: "bg-green-100 text-green-800" },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  CREATED: { label: "Not paid", className: "bg-neutral-200 text-neutral-700" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

// The saved discount is the coupon plus the free goodie. Split it back into
// its parts for display: [{ label, amount }], coupon first. Orders made before
// the goodie was free have no goodie discount, so all of theirs is the coupon.
export const discountParts = ({ items = [], discount = 0, couponCode = null }) => {
  const goodie = items.find((it) => it.productId === "goodie")?.discount ?? 0;
  const coupon = Math.round((discount - goodie) * 100) / 100;

  return [
    coupon > 0 && { label: couponCode ? `Coupon ${couponCode}` : "Discount", amount: coupon },
    goodie > 0 && { label: "Goodie (free)", amount: goodie },
  ].filter(Boolean);
};
