import { supabase } from "../config/supabase.js";
import { PaymentError } from "./payment.error.js";

// Cashfree minimum order amount is INR 1.00
const MIN_TOTAL_PAISE = 100;

// Unpaid orders only hold a coupon use for this long
const PENDING_HOLD_MINUTES = 30;

const MAX_LINE_ITEMS = 20;

const toPaise = (rupees) => Math.round(Number(rupees) * 100);
const toRupees = (paise) => paise / 100;

const formatRupees = (paise) => `₹${(paise / 100).toFixed(2)}`;

export const normalizeCouponCode = (code) =>
    typeof code === "string" && code.trim() ? code.trim().toUpperCase() : null;

// Counts coupon uses: paid orders, plus recent unpaid ones (so an abandoned
// checkout does not burn a use forever).
const countCouponUses = async (code, userIrisId = null) => {
    const holdSince = new Date(
        Date.now() - PENDING_HOLD_MINUTES * 60 * 1000
    ).toISOString();

    let query = supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("coupon_code", code)
        .or(
            `status.eq.SUCCESS,and(status.in.(CREATED,PENDING),created_at.gte.${holdSince})`
        );

    if (userIrisId) {
        query = query.eq("user_iris_id", userIrisId);
    }

    const { count, error } = await query;

    if (error) {
        console.error("Failed to count coupon uses:", error);
        throw new Error("Failed to check coupon usage");
    }

    return count ?? 0;
};

const applyCoupon = async ({ code, subtotalPaise, userIrisId }) => {
    const { data: coupon, error } = await supabase
        .from("payment_coupons")
        .select("*")
        .eq("code", code)
        .maybeSingle();

    if (error) {
        console.error("Failed to fetch coupon:", error);
        throw new Error("Failed to check coupon");
    }

    // Same message for unknown / inactive so codes cannot be enumerated
    if (!coupon || !coupon.active) {
        throw new PaymentError("Invalid coupon code");
    }

    const now = Date.now();

    if (coupon.valid_from && now < new Date(coupon.valid_from).getTime()) {
        throw new PaymentError("Coupon is not active yet");
    }

    if (coupon.valid_until && now > new Date(coupon.valid_until).getTime()) {
        throw new PaymentError("Coupon has expired");
    }

    const minOrderPaise = toPaise(coupon.min_order_amount || 0);

    if (subtotalPaise < minOrderPaise) {
        throw new PaymentError(
            `Coupon needs a minimum order of ${formatRupees(minOrderPaise)}`
        );
    }

    if (coupon.max_uses !== null && coupon.max_uses !== undefined) {
        const totalUses = await countCouponUses(code);

        if (totalUses >= coupon.max_uses) {
            throw new PaymentError("Coupon usage limit reached");
        }
    }

    const userUses = await countCouponUses(code, userIrisId);

    if (userUses >= coupon.per_user_limit) {
        throw new PaymentError("You have already used this coupon");
    }

    let discountPaise;

    if (coupon.discount_type === "PERCENT") {
        discountPaise = Math.floor(
            (subtotalPaise * Number(coupon.discount_value)) / 100
        );

        if (coupon.max_discount !== null && coupon.max_discount !== undefined) {
            discountPaise = Math.min(discountPaise, toPaise(coupon.max_discount));
        }
    } else {
        discountPaise = toPaise(coupon.discount_value);
    }

    discountPaise = Math.min(discountPaise, subtotalPaise);

    return discountPaise;
};

/**
 * Server-side price calculation. The client only says WHAT it wants
 * (product ids + quantities + coupon code); every rupee comes from the DB.
 *
 * Returns amounts in rupees, computed in integer paise to avoid float drift.
 */
export const quoteOrder = async ({ items, couponCode, userIrisId }) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new PaymentError("Cart is empty");
    }

    if (items.length > MAX_LINE_ITEMS) {
        throw new PaymentError("Too many items in cart");
    }

    // Merge duplicate product lines
    const quantities = new Map();

    for (const item of items) {
        const productId = typeof item?.productId === "string" ? item.productId.trim() : "";
        const quantity = item?.quantity;

        if (!productId) {
            throw new PaymentError("Invalid cart item");
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new PaymentError("Quantity must be a whole number of at least 1");
        }

        quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    const { data: products, error } = await supabase
        .from("payment_products")
        .select("id, name, category, variant, unit_price, max_quantity, active")
        .in("id", [...quantities.keys()]);

    if (error) {
        console.error("Failed to fetch products:", error);
        throw new Error("Failed to fetch products");
    }

    const productsById = new Map(products.map((p) => [p.id, p]));

    const lineItems = [];
    let subtotalPaise = 0;

    for (const [productId, quantity] of quantities) {
        const product = productsById.get(productId);

        if (!product || !product.active) {
            throw new PaymentError(`Item "${productId}" is not available`);
        }

        if (quantity > product.max_quantity) {
            throw new PaymentError(
                `You can buy at most ${product.max_quantity} of "${product.name}"`
            );
        }

        const unitPricePaise = toPaise(product.unit_price);
        const linePaise = unitPricePaise * quantity;

        subtotalPaise += linePaise;

        lineItems.push({
            productId: product.id,
            name: product.name,
            category: product.category,
            variant: product.variant ?? null,
            quantity,
            unitPrice: toRupees(unitPricePaise),
            lineTotal: toRupees(linePaise),
        });
    }

    const code = normalizeCouponCode(couponCode);
    let discountPaise = 0;

    if (code) {
        discountPaise = await applyCoupon({ code, subtotalPaise, userIrisId });
    }

    const totalPaise = subtotalPaise - discountPaise;

    if (totalPaise < MIN_TOTAL_PAISE) {
        throw new PaymentError(
            `Order total must be at least ${formatRupees(MIN_TOTAL_PAISE)}`
        );
    }

    return {
        items: lineItems,
        subtotal: toRupees(subtotalPaise),
        discount: toRupees(discountPaise),
        total: toRupees(totalPaise),
        couponCode: discountPaise > 0 ? code : null,
        currency: "INR",
    };
};

// Public catalog for the store page: only what the UI needs to render
export const listProducts = async () => {
    const { data, error } = await supabase
        .from("payment_products")
        .select("id, name, category, group_key, variant, unit_price, max_quantity")
        .eq("active", true)
        .order("group_key", { ascending: true })
        .order("id", { ascending: true });

    if (error) {
        console.error("Failed to list products:", error);
        throw new Error("Failed to fetch products");
    }

    return data.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        groupKey: p.group_key ?? p.id,
        variant: p.variant,
        unitPrice: Number(p.unit_price),
        maxQuantity: p.max_quantity,
    }));
};
