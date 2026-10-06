// What a shirt is called on screen. The catalog rows are named "T-Shirt A",
// "T-Shirt B" and (for two sizes) "Parva Tee (Black)", and orders already paid
// keep those names in their saved items, so the two designs are named from
// their ids instead: tshirt-a-* is the regular fit, tshirt-b-* the oversized.
const SHIRTS = [
  [/^tshirt-a(-|$)/, "Regular T-shirt"],
  [/^tshirt-b(-|$)/, "Oversized T-shirt"],
];

// id: a product id (tshirt-a-m) or a design key (tshirt-a); name: the stored name
export const shirtName = (id, name) => SHIRTS.find(([pattern]) => pattern.test(id ?? ""))?.[1] ?? name;
