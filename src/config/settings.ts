/** How long management has to approve a quote before it becomes overdue. */
export const APPROVAL_WINDOW_HOURS = 3;

export interface Product {
  name: string;
  unitPrice: number;
  unitCost: number;
}

/** Sample price list until the client shares the real one. */
export const PRODUCTS: Product[] = [
  { name: "750ml Round Container", unitPrice: 9.2, unitCost: 7.1 },
  { name: "500ml Rectangular Container", unitPrice: 7.4, unitCost: 5.6 },
  { name: "1000ml Round Container", unitPrice: 11.5, unitCost: 8.9 },
  { name: "450ml Foil Container", unitPrice: 6.8, unitCost: 5.1 },
  { name: "660ml Foil Container", unitPrice: 8.1, unitCost: 6.2 },
  { name: "250ml Sauce Cup", unitPrice: 2.4, unitCost: 1.7 },
];

export function findProduct(name: string): Product {
  return PRODUCTS.find((product) => product.name === name) ?? PRODUCTS[0];
}
