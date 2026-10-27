/**
 * Runtime logo placement config for products whose company logo is positioned LIVE on
 * the PDP (blank garment base image + a CSS-positioned logo overlay) instead of
 * being pre-baked into the static webp. Lets a customer pick the logo POSITION
 * and STYLE without loading a new image — the overlay just moves / re-tints.
 *
 * Coordinate system (identical to the sm bake pipeline): a placement is a
 * NORMALIZED box { x, y, w, h } where all four are fractions 0..1 of the BASE
 * IMAGE's own width/height (x,y = top-left of the box). The logo is drawn
 * object-contain (aspect preserved) and centred inside that box, optionally
 * rotated `rotation` degrees clockwise. The overlay renderer converts these
 * image-space fractions to on-screen coordinates, accounting for the
 * object-contain letterboxing of the base image inside the carousel panel.
 *
 * No products currently use the overlay (LOGO_PRODUCTS is empty); the types and
 * helpers remain so it can be re-enabled by adding product entries.
 */

export type LogoPosition = "left-chest" | "right-chest" | "sleeve";
export type LogoStyle = "tone" | "default";

export interface LogoBox {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Clockwise degrees about the box centre. */
  rotation: number;
}

/** Which garment view a position lives on. Chest positions show the front view;
 *  the sleeve position swaps the primary image to the side view. */
export type LogoViewKey = "front" | "side";

export interface LogoColorDef {
  /** Image-filename slug for this colour (matches /final-drive/<slug>*). */
  slug: string;
  /** Per-colour tone-on-tone logo (transparent PNG). */
  toneLogo: string;
  /** Default full company logo for this colour: dark (bold) on light garments,
   *  white (invert) on dark garments — same rule the bake used. */
  defaultLogo: string;
  /** Blank base image per view (no company logo baked in), with its intrinsic
   *  aspect ratio (width/height) so the overlay can reproduce the
   *  object-contain letterbox without waiting for the image to load. */
  views: Record<LogoViewKey, { src: string; ar: number }>;
  /** Normalized placement box per position, in THAT position's view. */
  boxes: Record<LogoPosition, LogoBox>;
}

export interface LogoPositionOption {
  id: LogoPosition;
  /** i18n-free short label; the PDP wraps it in its own styling. */
  label: string;
  view: LogoViewKey;
}

export interface LogoProductDef {
  /** Offered positions, in display order. */
  positions: LogoPositionOption[];
  defaultPosition: LogoPosition;
  defaultStyle: LogoStyle;
  /** Ordered view keys → the carousel slide order for this product. */
  views: LogoViewKey[];
  /** Keyed by lowercased colour hex. */
  colors: Record<string, LogoColorDef>;
}

/** Mirror a box horizontally (left chest → right chest). */
export function mirrorBox(b: LogoBox): LogoBox {
  return { ...b, x: 1 - b.x - b.w, rotation: -b.rotation };
}

// Live-logo overlay data. No products currently offer the overlay, so the map is
// empty and getLogoConfig() returns null for every SKU — the feature stays inert
// until product entries are added here.
export const LOGO_PRODUCTS: Record<string, LogoProductDef> = {};

export function getLogoConfig(sku: string): LogoProductDef | null {
  return LOGO_PRODUCTS[sku] ?? null;
}

export function logoAsset(color: LogoColorDef, style: LogoStyle): string {
  return style === "tone" ? color.toneLogo : color.defaultLogo;
}
