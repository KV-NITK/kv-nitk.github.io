export const rupees = (n) => `₹${Number(n).toFixed(2)}`;

// "T-Shirt A (M) × 2". Older orders have no stored variant, so fall back to the id suffix.
export const itemLabel = (it) => {
  const isFood = it.category === 'FOOD' || it.productId.startsWith('bhoori');
  const variant = it.variant || (!isFood && it.productId.includes("-") ? it.productId.split("-").pop().toUpperCase() : "");
  return `${it.name}${variant ? ` (${variant})` : ""} × ${it.quantity}`;
};

export const STATUS_STYLES = {
  SUCCESS: { label: "Paid", className: "bg-green-100 text-green-800" },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  CREATED: { label: "Not paid", className: "bg-neutral-200 text-neutral-700" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};
