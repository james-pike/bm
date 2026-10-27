// Per-product minimum order quantity (MOQ). The PDP quantity selector starts at
// (and can't go below) this value, Add to Cart enforces it, and the cart/checkout
// stepper won't let the line drop below it either. Applies at every breakpoint.
export const MOQ_BY_SKU: Record<string, number> = {
};

/** The minimum order quantity for a SKU (1 when none is configured). */
export const moqForSku = (sku: string | undefined): number =>
  (sku && MOQ_BY_SKU[sku]) || 1;
