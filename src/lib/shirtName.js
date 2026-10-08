// What a shirt is called on screen. The catalog rows are named "T-Shirt A",
// "T-Shirt B" and (for two sizes) "Parva Tee (Black)", and orders already paid
// keep those names in their saved items, so the two designs are told apart by
// their ids instead: tshirt-a-* is the regular fit, tshirt-b-* the oversized.
const DESIGNS = [
  [/^tshirt-a(-|$)/, "regular", "Regular T-shirt"],
  [/^tshirt-b(-|$)/, "oversized", "Oversized T-shirt"],
];

const designOf = (id) => DESIGNS.find(([pattern]) => pattern.test(id ?? ""));

// id: a product id (tshirt-a-m) or a design key (tshirt-a); name: the stored name
export const shirtName = (id, name) => designOf(id)?.[2] ?? name;

// "regular", "oversized", or null for anything that is not one of the two shirts
export const shirtDesign = (id) => designOf(id)?.[1] ?? null;
