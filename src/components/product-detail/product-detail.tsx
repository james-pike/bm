import { component$, useSignal, useComputed$, useTask$, useVisibleTask$, $, useContext, type QRL } from "@builder.io/qwik";
import { Carousel } from "@qwik-ui/headless";
import { Link, useLocation } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { allProducts, colorName, categoryLabel } from "../../routes/apparel/products";
import { expandSizes, sortColorsWhiteLast } from "../../routes/apparel/utils";
import { LoginTypeContext } from "../../routes/layout";
import { swatchOrder, ProductCard, isSkuInLineup } from "../product-catalog/product-catalog";
import { CLOTHING_CATEGORIES } from "../../lib/categories";
import { ProductImage } from "../product-image/product-image";
import { LogoSlide } from "../logo-overlay/logo-slide";
import { getLogoConfig, logoAsset, type LogoPosition, type LogoStyle, type LogoBox } from "../../data/logo-placements";
import { MOQ_BY_SKU } from "../../moq";

// Colours whose per-colour IMAGE FILES use a slug that differs from the (renamed)
// display name. The gallery matches images by colour NAME → filename, so a rename
// like #ca7988 "Heather Scooter" → "Red" (files still heatherscooter-*) needs the
// original slug here, else no image matches and ALL colours' images show at once.
const IMG_NAME_ALIAS: Record<string, string> = {
  "#ca7988": "heatherscooter",
  "#1e40af": "royal", // UA polos: shown as "Blue" but the image files are "royal"
};
const imgNorm = (color: string) =>
  (IMG_NAME_ALIAS[color.toLowerCase()] ?? colorName(color, "en"))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Tall sizes are rendered on their own row, separate from the regular sizes.
const TALL_SIZES = new Set(["ST", "MT", "LT", "XLT", "2XLT", "3XLT", "4XLT", "5XLT"]);

// SKUs whose TALL fit costs more than the regular fit (both fits live on one
// product); selecting a tall size swaps the PDP price to this amount.
const TALL_PRICE: Record<string, number> = {};

// Base (fit-less) size tokens, largest last, for parsing fit variants.
const SIZE_BASES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];

/** Split a size token into its base and fit: "LT" → {base:"L",fit:"Tall"},
 *  "MS" → {base:"M",fit:"Short"}, "2XL" → {base:"2XL",fit:"Regular"}. */
function parseFitToken(tok: string): { base: string; fit: "Regular" | "Tall" | "Short" } {
  if (SIZE_BASES.includes(tok)) return { base: tok, fit: "Regular" };
  if (tok.endsWith("T")) {
    const base = tok.slice(0, -1);
    if (SIZE_BASES.includes(base)) return { base, fit: "Tall" };
  }
  if (tok.endsWith("S")) {
    const base = tok.slice(0, -1);
    if (SIZE_BASES.includes(base)) return { base, fit: "Short" };
  }
  return { base: tok, fit: "Regular" };
}

/**
 * Derive fit-variant size groups from a slash-separated sizes string, e.g.
 * "S - 3XL / LT - 2XLT" → { Regular: [S…3XL], Tall: [L…2XL] }. Each "/" group
 * must be a fit-suffixed range; anything else (volumes like "25 oz / 35 oz",
 * waist/length "W 30 - 52 / L 30 - 36") yields null so those never become
 * variants. Returns null unless at least two real fit groups are found — so a
 * product's sizes are NEVER clumped into one button when they span fits.
 */
function variantMapFromSizes(sizes: string): Record<string, string[]> | null {
  if (!sizes || !sizes.includes("/")) return null;
  const map: Record<string, string[]> = {};
  for (const group of sizes.split("/").map((s) => s.trim()).filter(Boolean)) {
    const m = group.match(/^(\S+)\s*-\s*(\S+)$/);
    if (!m) return null;
    const a = parseFitToken(m[1]);
    const b = parseFitToken(m[2]);
    const list = expandSizes(`${a.base} - ${b.base}`);
    // A range that doesn't expand to real sizes (e.g. "W 30 - 52") isn't a fit.
    if (list.length === 0 || (list.length === 1 && list[0].includes(" "))) return null;
    map[a.fit] = list;
  }
  return Object.keys(map).length >= 2 ? map : null;
}

// SKUs whose sizing is a waist × length grid (their own picker), never fit variants.
const waistLengthSkus = new Set(["BMFR-5"]);

// Explicit fit-variant size maps. Any product not listed here still gets fit
// variants automatically when its sizes string encodes them (variantMapFromSizes),
// so this is only for overrides that can't be derived from the sizes string.
const variantSizesBySku: Record<string, Record<string, string[]>> = {
  // Black & McDonald Regular / Tall fits (as on the original BM product page).
  "BMGC-1": { "Regular": ["S", "M", "L", "XL", "2XL", "3XL", "4XL"], "Tall": ["L", "XL", "2XL", "3XL"] },
  "BMGC-3": { "Regular": ["S", "M", "L", "XL", "2XL", "3XL"], "Tall": ["L", "XL", "2XL"] },
  "BMGC-4": { "Regular": ["S", "M", "L", "XL", "2XL", "3XL"], "Tall": ["L", "XL", "2XL"] },
  "BMGC-5": { "Regular": ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"], "Tall": ["M", "L", "XL", "2XL", "3XL", "4XL"] },
  "BMGC-7": { "Regular": ["S", "M", "L", "XL", "2XL", "3XL", "4XL"], "Tall": ["L", "XL", "2XL", "3XL"] },
  "BMFR-1": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-2": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-3": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-4": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-6": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-7": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-10": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-11": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-12": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
  "BMFR-13": { "Regular": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"], "Tall": ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"] },
};

// A product has fit variants when it's explicitly configured OR its sizes string
// encodes fit groups (e.g. "S - 3XL / LT - 2XLT"). Waist/length SKUs use their own
// picker, so they never resolve to fit variants. This is what stops multi-fit sizes
// from ever being clumped into a single size button. Module-scoped (not a closure)
// so it can be referenced from Qwik's $ / useComputed$ / useTask$ boundaries.
function getVariantMap(
  p: { sku: string; sizes: string } | null | undefined,
): Record<string, string[]> | null {
  if (!p || waistLengthSkus.has(p.sku)) return null;
  return variantSizesBySku[p.sku] ?? variantMapFromSizes(p.sizes);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Composite the logo onto the blank garment view (same algorithm as the sm bake:
 * logo fit object-contain + centred inside the normalized box, then rotated) and
 * return a small data-URL thumbnail — so the cart line item shows the chosen
 * view + logo position/style/colour, not a generic product photo.
 */
async function composeLogoThumb(
  baseSrc: string,
  logoSrc: string,
  box: LogoBox,
): Promise<string | null> {
  try {
    const [base, logo] = await Promise.all([loadImage(baseSrc), loadImage(logoSrc)]);
    const maxW = 360;
    const scale = Math.min(1, maxW / base.naturalWidth);
    const W = Math.max(1, Math.round(base.naturalWidth * scale));
    const H = Math.max(1, Math.round(base.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(base, 0, 0, W, H);
    const bx = box.x * W, by = box.y * H, bw = box.w * W, bh = box.h * H;
    const ls = Math.min(bw / logo.naturalWidth, bh / logo.naturalHeight);
    const lw = logo.naturalWidth * ls, lh = logo.naturalHeight * ls;
    const px = bx + (bw - lw) / 2, py = by + (bh - lh) / 2;
    if (box.rotation) {
      ctx.save();
      ctx.translate(px + lw / 2, py + lh / 2);
      ctx.rotate((box.rotation * Math.PI) / 180);
      ctx.drawImage(logo, -lw / 2, -lh / 2, lw, lh);
      ctx.restore();
    } else {
      ctx.drawImage(logo, px, py, lw, lh);
    }
    return canvas.toDataURL("image/webp", 0.85);
  } catch {
    return null;
  }
}

interface ProductDetailPanelProps {
  /** SKU to render (from the route param, or the in-frame catalog overlay). */
  sku: string;
  /** In-frame overlay mode: when set, renders a close button instead of the
      breadcrumb, and related items switch the panel in place instead of navigating. */
  onClose$?: QRL<() => void>;
  onSelectSku$?: QRL<(sku: string) => void>;
  /** Single-SKU showcase (the public /toque page): suppress the "more
      products" carousel so only this one product is shown. */
  single?: boolean;
  /** Route-specific price override (the public /toque page prices the toque at
      $13.25, while the same SKU is $15.25 in the logged-in catalog). */
  priceOverride?: number;
}

/**
 * The product-detail view — image carousel, size/colour/variant pickers, add-to-
 * cart and the related-items carousel. Rendered both as the /apparel/[sku]/ route
 * (full page) and as the catalog's in-frame overlay panel; the two never diverge
 * because they share this one component. `sku` comes from a prop rather than the
 * route so the same logic drives both.
 */
export const ProductDetailPanel = component$<ProductDetailPanelProps>((props) => {
  const locale = useContext(LocaleContext);
  const loginType = useContext(LoginTypeContext);
  const hidePrice = loginType.value === "tech";
  const inFrame = !!props.onClose$;

  // Reference props.sku directly inside computed/tasks so they re-track when the
  // panel is pointed at a different product (route [sku]→[sku] nav, or the
  // in-frame overlay switching products via a related item).
  const product = useComputed$(() => allProducts.find((p) => p.sku === props.sku) || null);
  // The catalog card can hand off a pre-selected colour via ?c=<hex> so the PDP
  // opens on the colour the shopper previewed in the gallery.
  const loc = useLocation();

  const imgIndex = useSignal(0);
  const touchStartX = useSignal(0);
  const selectedSize = useSignal("");
  const selectedColor = useSignal("");
  // The minimum-order quantity only applies in the single-product showcase
  // (the /toque route, props.single). On the regular catalog PDP the same SKU
  // behaves like any other product (min 1).
  const moq = props.single ? (MOQ_BY_SKU[props.sku] ?? 1) : 1;
  const selectedQty = useSignal(moq);
  const selectedWaist = useSignal("");
  const selectedLength = useSignal("");
  const selectedVariant = useSignal("");
  // Live logo overlay (products in LOGO_PRODUCTS): the chosen logo
  // position + style drive a CSS overlay instead of loading a new image.
  const selectedLogoPos = useSignal<LogoPosition | "">("");
  const selectedLogoStyle = useSignal<LogoStyle>("tone");
  const added = useSignal(false);
  const addedInfo = useSignal("");
  const imgFullscreen = useSignal(false);
  const imgLayout = useSignal<"rail" | "full">("rail");

  // Map each colour to the gallery image that depicts it, by matching the
  // colour's name against the image filename (e.g. "…-navy.png" ↔ "Navy"). Only
  // colours whose image exists get an entry, so products whose images are
  // alternate VIEWS (front/back of one colour) rather than colourways are left
  // untouched — clicking a swatch there won't move the gallery.
  const colorImgIndex = useComputed$(() => {
    const map: Record<string, number> = {};
    const p = product.value;
    if (!p) return map; // null while navigating away from a product route
    const imgs = (p.imgs && p.imgs.length ? p.imgs : [p.img]) as string[];
    // Folded one-image-per-colour products have parallel colors[]/imgs[] arrays
    // — map by index so a colour whose filename also contains ANOTHER colour's
    // name (e.g. the UA grey image "…csgreylightheatherwhite" contains "white")
    // still resolves to its own image rather than a substring collision. Same
    // rule imageForColor() uses for the swatch previews.
    if (p.colors.length === imgs.length) {
      p.colors.forEach((c, i) => { map[c] = i; });
      return map;
    }
    for (const color of p.colors) {
      const norm = imgNorm(color);
      if (!norm) continue;
      const idx = imgs.findIndex((src) =>
        src.toLowerCase().replace(/[^a-z0-9]/g, "").includes(norm),
      );
      if (idx >= 0) map[color] = idx;
    }
    return map;
  });

  // For per-colour products (each colour maps to its own images, e.g. the Travis
  // Mathew polos with front/side/chest per colour) show ONLY the selected
  // colour's images in the gallery, instead of every colour's images at once.
  const visibleImgs = useComputed$(() => {
    const p = product.value;
    if (!p) return [] as string[];
    const all = (p.imgs && p.imgs.length ? p.imgs : [p.img]) as string[];
    const color = selectedColor.value;
    // Folded one-image-per-colour products (parallel colors[]/imgs[]): show ONLY
    // the selected colour's single image. The other colours are swatch variants,
    // never alternate gallery slides — so e.g. picking grey on the UA polo shows
    // just the grey photo, not grey + white.
    if (color && p.colors.length > 1 && p.colors.length === all.length) {
      const i = p.colors.indexOf(color);
      if (i >= 0) return [all[i]];
    }
    const cmap = colorImgIndex.value;
    if (color && Object.keys(cmap).length > 1) {
      const norm = imgNorm(color);
      const filtered = norm
        ? all.filter((src) =>
            src.toLowerCase().replace(/[^a-z0-9]/g, "").includes(norm),
          )
        : [];
      if (filtered.length) return filtered;
    }
    return all;
  });
  // Keep the same view position (front/side/back/…) when switching colour instead
  // of snapping back to the first image — clamp it to the new colour's slide set.
  // For logo products the slide set is the logo views (front/side) PLUS any plain
  // extra photos (the back shot), so the clamp must count those too — otherwise
  // being on the back slide (index past the views) gets knocked off on a colour
  // change instead of staying on the back.
  useTask$(({ track }) => {
    track(() => selectedColor.value);
    const p0 = product.value;
    const cfg = p0 ? getLogoConfig(p0.sku) : null;
    const logoColour = !!(cfg && selectedColor.value && cfg.colors[selectedColor.value.toLowerCase()]);
    const n = logoColour
      ? cfg!.views.length + visibleImgs.value.filter((s) => /(back|chest)/i.test(s)).length
      : visibleImgs.value.length;
    if (imgIndex.value >= n) imgIndex.value = Math.max(0, n - 1);
  });
  // For logo-overlay products: picking a logo position also switches the primary
  // view (chest → front slide, sleeve → side slide). Within one view, changing
  // position only moves the overlay (no view change).
  useTask$(({ track }) => {
    const pos = track(() => selectedLogoPos.value);
    const p = product.value;
    if (!p || !pos) return;
    const cfg = getLogoConfig(p.sku);
    if (!cfg) return;
    const opt = cfg.positions.find((o) => o.id === pos);
    if (opt) imgIndex.value = Math.max(0, cfg.views.indexOf(opt.view));
  });

  const relatedPerView = useSignal(2);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const mq = window.matchMedia("(min-width: 1025px)");
    const apply = () => { relatedPerView.value = mq.matches ? 4 : 2; };
    apply();
    mq.addEventListener("change", apply);
    cleanup(() => mq.removeEventListener("change", apply));
  });

  // Warm the browser cache with EVERY colourway's image as soon as the PDP
  // opens, so the first swatch switch is instant instead of flashing while the
  // browser fetches the new image. Preloads the .webp the <picture> actually
  // renders. Re-runs when navigating to a different product.
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const p = track(() => product.value);
    if (!p) return;
    const urls = new Set<string>();
    const imgs = (p.imgs && p.imgs.length ? p.imgs : [p.img]) as string[];
    for (const src of imgs) if (src) urls.add(src.replace(/\.(jpe?g|png)$/i, ".webp"));
    // Logo products render the blank front/side bases and the tone/full logo as
    // CSS background-images (LogoSlide), which are NOT in `imgs`. Preload every
    // colour's bases + logos too, or the first few colour switches flash while
    // the new colour's base/logo load. These paths are already final (webp/png).
    const cfg = getLogoConfig(p.sku);
    if (cfg) {
      for (const c of Object.values(cfg.colors)) {
        urls.add(c.views.front.src);
        urls.add(c.views.side.src);
        urls.add(c.toneLogo);
        urls.add(c.defaultLogo);
      }
    }
    for (const src of urls) {
      if (!src) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      // Decode ahead of time (not just download) so the FIRST switch to a colour
      // repaints instantly instead of decoding on paint — the source of the
      // remaining flash on the chest/back slide. Ignore failures (e.g. 404).
      img.decode?.().catch(() => {});
    }
  });

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
  const waistOptionsBySku: Record<string, string[]> = {
  };
  const lengthOptionsBySku: Record<string, string[]> = {
  };
  const waistOptions = ["28", "29", "30", "31", "32", "33", "34", "35", "36", "38", "40", "42", "44", "46", "48", "50"];
  const lengthOptions = ["30", "32", "34", "36"];

  const sizeOptions = useComputed$<string[]>(() => {
    const p = product.value;
    if (!p) return [];
    const variantMap = getVariantMap(p);
    if (variantMap) {
      if (selectedVariant.value && variantMap[selectedVariant.value]) {
        return variantMap[selectedVariant.value];
      }
      const union = new Set<string>();
      Object.values(variantMap).forEach((arr) => arr.forEach((s) => union.add(s)));
      return Array.from(union).sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
    }
    return expandSizes(p.sizes);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => selectedVariant.value);
    const p = product.value;
    if (p && waistLengthSkus.has(p.sku)) return;
    if (!selectedSize.value) return;
    if (!sizeOptions.value.includes(selectedSize.value)) {
      selectedSize.value = "";
    }
  });

  const addToCart = $(async () => {
    const p = product.value;
    if (!p || !selectedSize.value) return;
    if (p.colors.length > 0 && !selectedColor.value) return;
    if (waistLengthSkus.has(p.sku) && (!selectedWaist.value || !selectedLength.value)) return;
    if (getVariantMap(p) && !selectedVariant.value) return;
    const sizeVal = waistLengthSkus.has(p.sku)
      ? `W${selectedWaist.value} x L${selectedLength.value}`
      : getVariantMap(p)
        ? `${selectedSize.value} ${selectedVariant.value}`
        : selectedSize.value;
    // For logo-overlay products, bake a thumbnail that reflects the chosen view
    // (sleeve → side image, chest → front) with the logo composited at the
    // selected position/style, so the cart shows exactly what was configured.
    let logoThumb: string | null = null;
    const lcfgThumb = getLogoConfig(p.sku);
    if (lcfgThumb && selectedLogoPos.value && selectedColor.value) {
      const cc = lcfgThumb.colors[selectedColor.value.toLowerCase()];
      const opt = lcfgThumb.positions.find((o) => o.id === selectedLogoPos.value);
      if (cc && opt) {
        logoThumb = await composeLogoThumb(
          cc.views[opt.view].src,
          logoAsset(cc, selectedLogoStyle.value),
          cc.boxes[selectedLogoPos.value as LogoPosition],
        );
      }
    }
    try {
      const saved = localStorage.getItem(`ce_cart_bm_${loginType.value || "clothing"}`);
      const items = saved ? JSON.parse(saved) : [];
      const lcfg = getLogoConfig(p.sku);
      const logoActiveCart = !!(lcfg && selectedLogoPos.value);
      const logoPosLabel = logoActiveCart
        ? lcfg!.positions.find((o) => o.id === selectedLogoPos.value)?.label ?? ""
        : "";
      const logoStyleLabel = selectedLogoStyle.value === "tone" ? "Tone on tone" : "Standard";
      const existing = items.find(
        (i: any) => i.name === p.name && i.size === sizeVal && i.color === selectedColor.value
          && (!logoActiveCart || (i.logoPosition === logoPosLabel && i.logoStyle === logoStyleLabel))
      );
      if (existing) {
        existing.quantity += selectedQty.value;
      } else {
        const codeMatch = p.details?.match(/#[A-Za-z0-9]+/);
        let colorVal = selectedColor.value;
        if (!colorVal && (!p.colors || p.colors.length === 0)) {
          const nm = p.name.match(/\s-\s([A-Za-z ]+)$/);
          if (nm) colorVal = nm[1].trim();
        }
        // Cart thumbnail: use the SELECTED colour's image via the SAME colour→
        // image map the gallery uses (colorImgIndex). That map is index-mapped
        // for folded parallel colors[]/imgs[] products, so a filename containing
        // another colour's name — e.g. the UA grey image "…greyheatherwhite"
        // contains "white" — can't cross-match (which showed grey for white).
        let colorImg = p.img;
        if (selectedColor.value) {
          const all = (p.imgs && p.imgs.length ? p.imgs : [p.img]) as string[];
          const idx = colorImgIndex.value[selectedColor.value];
          if (idx !== undefined && all[idx]) colorImg = all[idx];
        }
        // Prefer the composited logo thumbnail when we have one.
        if (logoThumb) colorImg = logoThumb;
        const item: any = {
          name: p.name,
          sku: p.sku,
          category: p.category,
          size: sizeVal,
          color: colorVal,
          quantity: selectedQty.value,
          price: props.priceOverride ?? p.price,
          img: colorImg,
          // Carry the MOQ that applied where this was added, so the cart floor is
          // per-line (toque adds carry 48; the regular route carries 1).
          moq,
        };
        if (codeMatch) item.code = codeMatch[0];
        if (waistLengthSkus.has(p.sku)) {
          item.waist = selectedWaist.value;
          item.length = selectedLength.value;
        }
        if (getVariantMap(p)) {
          item.variant = selectedVariant.value;
        }
        if (logoActiveCart) {
          item.logoPosition = logoPosLabel;
          item.logoStyle = logoStyleLabel;
        }
        items.push(item);
      }
      localStorage.setItem(`ce_cart_bm_${loginType.value || "clothing"}`, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) { console.error("addToCart error:", err); }
    addedInfo.value = selectedColor.value ? `${p.name} — ${colorName(selectedColor.value, "en")} / ${sizeVal}` : `${p.name} — ${sizeVal}`;
    added.value = true;
    selectedQty.value = moq;
    setTimeout(() => { added.value = false; }, 1680);
  });

  useTask$(({ track }) => {
    track(() => props.sku);
    imgIndex.value = 0;
    imgFullscreen.value = false;
    selectedQty.value = moq;
    selectedWaist.value = "";
    selectedLength.value = "";
    selectedVariant.value = "";
    selectedSize.value = "";
    selectedColor.value = "";
    const p0 = product.value;
    if (!p0) return;
    // Open on the colour whose image is the card's default (p.img) — folded
    // products have parallel colors[]/imgs[], so the colour at that image's index
    // is the one the card showed. Fall back to the first colour (white last).
    const all0 = (p0.imgs && p0.imgs.length ? p0.imgs : [p0.img]) as string[];
    const defIdx = all0.indexOf(p0.img);
    selectedColor.value = defIdx >= 0 && p0.colors[defIdx] !== undefined
      ? p0.colors[defIdx]
      : sortColorsWhiteLast(p0.colors)[0];
    // Honour a colour handed off from the gallery card (?c=<hex>), when it's a
    // real colour of this product — otherwise keep the default colour above.
    const wantColor = loc.url.searchParams.get("c");
    if (wantColor) {
      const dec = decodeURIComponent(wantColor).toLowerCase();
      const match = p0.colors.find((c) => c.toLowerCase() === dec);
      if (match) selectedColor.value = match;
    }
    // Open on the colour the gallery card was showing (its default image colour,
    // or whatever swatch the user switched to before clicking through). The card
    // stashes it in sessionStorage right before navigating; consume it once.
    try {
      const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("pdp-initial-color") : null;
      if (raw) {
        const saved = JSON.parse(raw) as { sku?: string; color?: string };
        if (saved && saved.sku === p0.sku && saved.color && p0.colors.includes(saved.color)) {
          selectedColor.value = saved.color;
        }
        sessionStorage.removeItem("pdp-initial-color");
      }
    } catch { /* sessionStorage unavailable (SSR / private mode) — keep default */ }
    const lcfg0 = getLogoConfig(p0.sku);
    if (lcfg0) {
      selectedLogoPos.value = lcfg0.defaultPosition;
      selectedLogoStyle.value = lcfg0.defaultStyle;
      // Start on the default position's view (e.g. sleeve → side slide).
      const opt = lcfg0.positions.find((o) => o.id === lcfg0.defaultPosition);
      if (opt) imgIndex.value = Math.max(0, lcfg0.views.indexOf(opt.view));
    } else {
      selectedLogoPos.value = "";
      selectedLogoStyle.value = "tone";
    }
    if (waistLengthSkus.has(p0.sku)) {
      selectedSize.value = "W/L";
    } else if (getVariantMap(p0)) {
      const variantMap = getVariantMap(p0)!;
      const variantKeys = Object.keys(variantMap);
      const defVariant = variantKeys.includes("Regular") ? "Regular" : variantKeys[0];
      selectedVariant.value = defVariant;
      const sizes = variantMap[defVariant];
      const lIdx = sizes.indexOf("L");
      selectedSize.value = lIdx !== -1 ? sizes[lIdx] : sizes[0];
    } else {
      const sizes = expandSizes(p0.sizes);
      const lIdx = sizes.indexOf("L");
      selectedSize.value = lIdx !== -1 ? sizes[lIdx] : sizes[0];
    }
  });

  if (!product.value) {
    return (
      <div class="apparel-catalog" id="products">
        <div class="product-detail">
          <p style={{ padding: "2rem", textAlign: "center" }}>{t("product.notfound", locale.value)}</p>
        </div>
      </div>
    );
  }

  const p = product.value;
  const pdf = (p as any).pdf as string | undefined;
  const hasMultipleImgs = visibleImgs.value.length > 1;
  // Live logo overlay: resolve the config + the selected colour's blank bases /
  // placement boxes. `logoActive` gates the whole feature to configured SKUs.
  const logoDef = getLogoConfig(p.sku);
  const logoColor = logoDef && selectedColor.value
    ? logoDef.colors[selectedColor.value.toLowerCase()] ?? null
    : null;
  const logoActive = !!(logoDef && logoColor);
  const logoPosOpt = logoDef && selectedLogoPos.value
    ? logoDef.positions.find((o) => o.id === selectedLogoPos.value) ?? null
    : null;
  // A view shows the logo ONLY when the customer's SELECTED position lives on it
  // (chest → front, sleeve → side). Picking "Right chest" leaves the side view
  // bare; picking "Sleeve" leaves the front views bare. The un-logo'd view just
  // renders the pre-logo blank base (exported from the sm and preloaded), so the
  // garment shown always matches the order and switching stays instant. Returning
  // the selected option (not merely the first one on the view) also means the box
  // is the selected placement — e.g. right-chest vs left-chest, not always left.
  const posForView = (vk: string) =>
    logoPosOpt && logoPosOpt.view === vk ? logoPosOpt : null;
  // For logo products the carousel shows the live logo VIEWS (front/side) first,
  // then any plain alternate photos for the colour that aren't part of the
  // overlay system — e.g. the FootJoy back shot — as extra slides after them.
  // Plain extra photos for logo products (shown as slides after the live logo
  // views): the FootJoy back shot and the Heater Jersey chest close-up. NOT the
  // side view (that's already a logo view), so match only back/chest, not side.
  const logoExtraImgs = logoActive ? visibleImgs.value.filter((s) => /(back|chest)/i.test(s)) : [];
  const logoThumbs = logoActive
    ? [...logoDef!.views.map((vk) => logoColor!.views[vk].src), ...logoExtraImgs]
    : [];
  // Effective carousel slide count (logo views + extra photos, or plain images).
  const slideCount = logoActive ? logoThumbs.length : visibleImgs.value.length;
  const isFootwear = (c: string) => c === "Safety Boots" || c === "Safety Shoes" || c === "Footwear";
  const tabCategory = isFootwear(p.category) ? "Footwear" : p.category;
  const catHash = tabCategory.toLowerCase().replace(/\s+/g, "-");
  const backLabel = loginType.value === "tech" ? t("cat.Work Wear", locale.value) : t("nav.apparel", locale.value);
  const catLabel = categoryLabel(tabCategory, locale.value);

  return (
    <div class={`apparel-catalog ${inFrame ? "apparel-catalog--inframe" : ""}`} id={inFrame ? undefined : "products"}>
      {inFrame ? (
        <button class="product-detail__close" aria-label="Close" onClick$={() => props.onClose$?.()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
        </button>
      ) : (
        <nav class="pdp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" class="pdp-breadcrumb__link pdp-breadcrumb__back">
            <svg class="pdp-breadcrumb__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span>{backLabel}</span>
          </Link>
          <Link href={`/#${catHash}`} class="pdp-breadcrumb__link pdp-breadcrumb__cat">
            {tabCategory === "New Hire Kit" ? (
              <>
                <span class="pdp-breadcrumb__cat-full">{catLabel}</span>
                <span class="pdp-breadcrumb__cat-short">{t("cat.newhirekit.short", locale.value)}</span>
              </>
            ) : catLabel}
          </Link>
          <span class="pdp-breadcrumb__sku">{p.sku}</span>
          {hasMultipleImgs && (
            <button
              class="pdp-breadcrumb__view"
              aria-label={imgLayout.value === "rail" ? "Full-width image" : "Show image previews"}
              onClick$={() => (imgLayout.value = imgLayout.value === "rail" ? "full" : "rail")}
            >
              {imgLayout.value === "rail" ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              )}
            </button>
          )}
        </nav>
      )}
      <div class={`product-detail ${imgLayout.value === "full" ? "product-detail--imgfull" : ""} ${props.single ? "product-detail--no-zoom" : ""}`}>
        <div class="product-modal__layout">
          <div class="product-image-row">
            <div
              class="product-carousel"
              onTouchStart$={(e) => { touchStartX.value = e.touches[0].clientX; }}
              onTouchEnd$={(e) => {
                const diff = touchStartX.value - e.changedTouches[0].clientX;
                const n = slideCount;
                if (Math.abs(diff) > 40 && n > 1) {
                  if (diff > 0) {
                    imgIndex.value = (imgIndex.value + 1) % n;
                  } else {
                    imgIndex.value = (imgIndex.value - 1 + n) % n;
                  }
                }
              }}
              onClick$={() => {
                // The public /toque showcase (single) doesn't enlarge the image —
                // its short page clipped the fullscreen viewer. Clicking just
                // advances to the next photo.
                if (!props.single && window.innerWidth > 1024) {
                  imgFullscreen.value = true;
                } else if (slideCount > 1) {
                  imgIndex.value = (imgIndex.value + 1) % slideCount;
                }
              }}
            >
              {logoActive
                ? (() => {
                    const views = logoDef!.views;
                    // The first slides are the live logo VIEWS (front/side); any
                    // extra colour photos (the back shot) follow as plain images.
                    if (imgIndex.value >= views.length) {
                      const src = logoExtraImgs[imgIndex.value - views.length];
                      // Stable key (by slot, NOT src) so a colour change swaps this
                      // <img>'s src in place instead of remounting a blank element —
                      // the new colour's photo is preloaded+decoded, so it repaints
                      // with no flash. (Remounting on key={src} caused the flicker.)
                      return (
                        <picture key={`logo-extra-${imgIndex.value - views.length}`}>
                          <source srcset={src.replace(/\.(jpe?g|png)$/i, ".webp")} type="image/webp" />
                          <img
                            src={src}
                            alt={p.name}
                            width="600"
                            height="400"
                            loading="eager"
                            decoding="async"
                            class="product-carousel__slide active"
                          />
                        </picture>
                      );
                    }
                    // Render only the CURRENT view (front or side). Selecting a
                    // position switches the view; clicking a thumbnail does too.
                    // The logo shows only on the view the selected position lives
                    // on (chest → front, sleeve → side).
                    const vk = views[imgIndex.value] ?? views[0];
                    const viewPos = posForView(vk);
                    const showLogo = !!viewPos;
                    return (
                      <LogoSlide
                        // Key by the base image so a colour/view swap remounts a
                        // fresh <img> (it repaints); position/style changes keep
                        // the same base, so only the overlay moves.
                        key={logoColor!.views[vk].src}
                        base={logoColor!.views[vk].src}
                        ar={logoColor!.views[vk].ar}
                        logo={showLogo ? logoAsset(logoColor!, selectedLogoStyle.value) : null}
                        box={showLogo ? logoColor!.boxes[viewPos!.id] : null}
                        active={true}
                        alt={p.name}
                        eager={true}
                      />
                    );
                  })()
                : (visibleImgs.value).map((src, i) => (
                <picture key={i}>
                  <source srcset={src.replace(/\.(jpe?g|png)$/i, ".webp")} type="image/webp" />
                  <img
                    src={src}
                    alt={p.name}
                    width="600"
                    height="400"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding="async"
                    class={`product-carousel__slide ${imgIndex.value === i ? "active" : ""} ${src.includes("spec") ? "product-carousel__slide--contain" : ""}`}
                    style={src.includes("BACK") ? { objectPosition: "center 65%" } : {}}
                  />
                </picture>
              ))}
              {pdf && (
                <a href={pdf} target="_blank" class="product-modal__pdf" onClick$={(e) => e.stopPropagation()}>
                  {t("product.specsheet.pdf", locale.value)}
                </a>
              )}
              {slideCount > 1 && (
                <div class="product-carousel__indicators">
                  {Array.from({ length: slideCount }).map((_, i) => (
                    <button
                      key={i}
                      class={`product-carousel__dot ${imgIndex.value === i ? "active" : ""}`}
                      aria-label={`Image ${i + 1}`}
                      onClick$={(e) => { e.stopPropagation(); imgIndex.value = i; }}
                    />
                  ))}
                </div>
              )}
            </div>
            {slideCount > 1 && (
              <div class="product-thumbs product-thumbs--column">
                {(logoActive ? logoThumbs : visibleImgs.value).map((src, i) => (
                  <button
                    key={i}
                    class={`product-thumbs__item ${imgIndex.value === i ? "active" : ""}`}
                    onClick$={() => { imgIndex.value = i; }}
                  >
                    <ProductImage src={src} alt={`${p.name} ${i + 1}`} width={80} height={80} loading={i === 0 ? "eager" : "lazy"} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div class="product-modal__details">
            <h2 class="product-modal__name">{p.name}</h2>
            {!hidePrice && (() => {
              // Tall fit costs more on some SKUs. The fit is either a Regular/Tall
              // variant toggle (getVariantMap) or a tall-suffixed size token.
              const isTall =
                (getVariantMap(p) != null && selectedVariant.value === "Tall") ||
                (!!selectedSize.value && TALL_SIZES.has(selectedSize.value));
              const price =
                isTall && TALL_PRICE[p.sku] != null
                  ? TALL_PRICE[p.sku]
                  : Number(props.priceOverride ?? p.price) || 0;
              // No price on $0 items (the company-supplied FR line).
              if (price <= 0) return null;
              return <div class="product-modal__price">${price.toFixed(2)}</div>;
            })()}
            {p.material && (
              <div class="product-modal__material">
                <strong>{t("modal.material", locale.value)}:</strong> {p.material}
              </div>
            )}
            {p.details && (
              <ul class={`product-modal__details-list ${p.details.split(",").length <= 2 ? "product-modal__details-list--single" : ""}`}>
                {p.details.split(",").map((detail, i) => (
                  <li key={i}>{detail.trim()}</li>
                ))}
              </ul>
            )}
            {!waistLengthSkus.has(p.sku) && (
            <div class={`product-modal__field ${logoActive ? "product-modal__field--with-logo" : ""}`}>
              <div class="product-modal__size-block">
                <label class="product-modal__label">{t("modal.size", locale.value)}{getVariantMap(p) && selectedVariant.value && <span class="product-modal__color-inline"> — {t(`variant.${selectedVariant.value}` as any, locale.value)}</span>}{!getVariantMap(p) && sizeOptions.value.some((s) => TALL_SIZES.has(s)) && selectedSize.value && <span class="product-modal__color-inline"> — {t(TALL_SIZES.has(selectedSize.value) ? "variant.Tall" : "variant.Regular", locale.value)}</span>}</label>
                <div class="product-modal__options">
                  {sizeOptions.value.filter((s) => !TALL_SIZES.has(s)).map((size) => (
                    <button
                      key={size}
                      class={`product-modal__option ${selectedSize.value === size ? "active" : ""}`}
                      onClick$={() => (selectedSize.value = size)}
                    >
                      {size === "One Size" ? t("modal.onesize", locale.value) : size}
                    </button>
                  ))}
                </div>
                {sizeOptions.value.some((s) => TALL_SIZES.has(s)) && (
                  <div class="product-modal__options product-modal__options--tall">
                    {sizeOptions.value.filter((s) => TALL_SIZES.has(s)).map((size) => (
                      <button
                        key={size}
                        class={`product-modal__option ${selectedSize.value === size ? "active" : ""}`}
                        onClick$={() => (selectedSize.value = size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {logoActive && (
                <div class="product-modal__logo-row">
                  <div class="product-modal__logo-group">
                    <label class="product-modal__label">Logo position{logoPosOpt && <span class="product-modal__color-inline"> — {logoPosOpt.label}</span>}</label>
                    <div class="product-modal__options">
                      {logoDef!.positions.map((opt) => (
                        <button
                          key={opt.id}
                          class={`product-modal__option ${selectedLogoPos.value === opt.id ? "active" : ""}`}
                          onClick$={() => (selectedLogoPos.value = opt.id)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div class="product-modal__logo-group">
                    <label class="product-modal__label">Style<span class="product-modal__color-inline"> — {selectedLogoStyle.value === "tone" ? "Tone on tone" : "Standard"}</span></label>
                    <div class="product-modal__options">
                      <button
                        class={`product-modal__option ${selectedLogoStyle.value === "default" ? "active" : ""}`}
                        onClick$={() => (selectedLogoStyle.value = "default")}
                      >
                        Standard
                      </button>
                      <button
                        class={`product-modal__option ${selectedLogoStyle.value === "tone" ? "active" : ""}`}
                        onClick$={() => (selectedLogoStyle.value = "tone")}
                      >
                        Tone on tone
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {logoActive && p.colors.length > 0 && (
                <div class="product-modal__color-block">
                  <label class="product-modal__label">{t("modal.color", locale.value)}{selectedColor.value && <span class="product-modal__color-inline"> — {colorName(selectedColor.value, locale.value)}</span>}</label>
                  <div class="product-modal__options">
                    {swatchOrder(p.colors).map((color) => (
                      <button
                        key={color}
                        class={`product-modal__color ${selectedColor.value === color ? "active" : ""}`}
                        style={{ background: color }}
                        onClick$={() => { selectedColor.value = color; }}
                        aria-label={colorName(color, locale.value)}
                        title={colorName(color, locale.value)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}
            {getVariantMap(p) && (
              <div class="product-modal__field">
                <label class="product-modal__label">{t("product.variant", locale.value)}</label>
                <div class="product-modal__options">
                  {Object.keys(getVariantMap(p) ?? {}).map((v) => (
                    <button
                      key={v}
                      class={`product-modal__option ${selectedVariant.value === v ? "active" : ""}`}
                      onClick$={() => (selectedVariant.value = v)}
                    >
                      {t(`variant.${v}` as any, locale.value)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {waistLengthSkus.has(p.sku) && (
              <div class="product-modal__field product-modal__waist-length-row">
                <div class="product-modal__select-group">
                  <label class="product-modal__label">{t("product.waist", locale.value)}</label>
                  <select
                    class="product-modal__select"
                    value={selectedWaist.value}
                    onChange$={(_, el) => (selectedWaist.value = el.value)}
                  >
                    <option value="" disabled>{t("product.select", locale.value)}</option>
                    {(waistOptionsBySku[p.sku] ?? waistOptions).map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div class="product-modal__select-group">
                  <label class="product-modal__label">{t("product.length", locale.value)}</label>
                  <select
                    class="product-modal__select"
                    value={selectedLength.value}
                    onChange$={(_, el) => (selectedLength.value = el.value)}
                  >
                    <option value="" disabled>{t("product.select", locale.value)}</option>
                    {(lengthOptionsBySku[p.sku] ?? lengthOptions).map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div class="product-modal__color-qty-row">
            {p.colors.length > 0 && !logoActive && (
              <div class="product-modal__field">
                <label class="product-modal__label">{t("modal.color", locale.value)}{selectedColor.value && <span class="product-modal__color-inline"> — {colorName(selectedColor.value, locale.value)}</span>}</label>
                <div class="product-modal__options">
                  {swatchOrder(p.colors).map((color) => (
                    <button
                      key={color}
                      class={`product-modal__color ${selectedColor.value === color ? "active" : ""}`}
                      style={{ background: color }}
                      onClick$={() => {
                        // Keep the current view (front/side/…) — the task below
                        // clamps imgIndex to the new colour's set instead of
                        // snapping back to the first image.
                        selectedColor.value = color;
                      }}
                      aria-label={colorName(color, locale.value)}
                      title={colorName(color, locale.value)}
                    />
                  ))}
                </div>
              </div>
            )}
            <div class="product-modal__field product-modal__qty-group">
              <label class="product-modal__label">{t("modal.quantity", locale.value)}{moq > 1 && <span class="product-modal__color-inline"> — {t("product.minorder", locale.value).replace("{n}", String(moq))}</span>}</label>
              <div class="product-modal__qty">
                <button class="product-modal__qty-btn" aria-label="Decrease quantity" onClick$={() => { if (selectedQty.value > moq) selectedQty.value--; }}>-</button>
                <input
                  type="text"
                  inputMode="numeric"
                  class="product-modal__qty-val product-modal__qty-input"
                  aria-label="Quantity"
                  value={selectedQty.value}
                  onInput$={(_, el) => {
                    // Allow free typing (digits only); clamp to the minimum on blur
                    // so e.g. the toque buyer can type 100/200 directly.
                    const n = parseInt(el.value.replace(/[^0-9]/g, ""), 10);
                    if (!Number.isNaN(n)) selectedQty.value = n;
                  }}
                  onChange$={(_, el) => {
                    let n = parseInt(el.value.replace(/[^0-9]/g, ""), 10);
                    if (Number.isNaN(n) || n < moq) n = moq;
                    selectedQty.value = n;
                    el.value = String(n);
                  }}
                />
                <button class="product-modal__qty-btn" aria-label="Increase quantity" onClick$={() => (selectedQty.value++)}>+</button>
              </div>
            </div>
            </div>
            <div class="product-modal__actions">
              <button
                class={`btn btn--primary product-modal__add product-modal__add--branded product-modal__add--v2 ${added.value ? "product-modal__add--added" : ""}`}
                disabled={!selectedSize.value || (waistLengthSkus.has(p.sku) && (!selectedWaist.value || !selectedLength.value)) || (getVariantMap(p) != null && !selectedVariant.value)}
                onClick$={addToCart}
              >
                <span class="product-modal__add-label">
                  <span class="product-modal__add-label-text product-modal__add-label-text--primary">{selectedSize.value ? t("modal.addtocart", locale.value) : t("modal.selectsize", locale.value)}</span>
                  <span class="product-modal__add-label-text product-modal__add-label-text--added">{t("modal.added", locale.value)}</span>
                </span>
                <span class="product-modal__add-mark" aria-hidden="true">
                  <svg class="product-modal__add-glyph product-modal__add-glyph--cart" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                  <svg class="product-modal__add-glyph product-modal__add-glyph--check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {!props.single && (() => {
        // Black & McDonald: the categories each login's catalog shows.
        const visibleByLogin: Record<string, string[]> = {
          clothing: CLOTHING_CATEGORIES.filter((c) => c !== "All"),
          tech: ["Work Wear"],
          electrical: ["Jackets", "Bibs & Pants", "Coveralls", "Hoodies", "Shirts"],
        };
        const isElectrical = loginType.value === "electrical";
        const visible = visibleByLogin[loginType.value] || visibleByLogin.clothing;
        const inVisible = visible.includes(p.category);
        // The "more products" carousel may ONLY contain items in the current
        // site's lineup — same rule the main catalog uses. Electrical shows just
        // its ELECTRICAL_SKUS; Service shows everything that isn't an
        // Electrical-only SKU or a Flame-Resistant item. Without this, an
        // Electrical-only SKU that happens to share a category (e.g. the Atlas
        // Guardian FR/AR hoodies, category "Sweaters") leaked into the Service
        // carousel even though it's off-lineup.
        const inLineup = (r: (typeof allProducts)[number]) =>
          isSkuInLineup(loginType.value, r as { sku: string; category: string; portals?: string[] });
        const sameCat = allProducts.filter((r) => r.sku !== p.sku && inLineup(r) && r.category === p.category);
        const allApparel = allProducts.filter((r) => r.sku !== p.sku && inLineup(r) && visible.includes(r.category));
        // Use the SKU's own category only when it has enough siblings to fill a
        // carousel; otherwise (e.g. Sweaters, with a single item) fall back to the
        // whole "Apparel" lineup so the row isn't empty/near-empty.
        const useCat = inVisible && sameCat.length >= 2;
        const related = isElectrical
          ? allProducts.filter((r) => r.sku !== p.sku && inLineup(r)).slice(0, 8)
          : (useCat ? sameCat : allApparel).slice(0, 8);
        const headingSuffix = isElectrical ? t("login.portal.electrical", locale.value) : useCat ? catLabel : t("nav.apparel", locale.value);
        return (
          <div class="related-items">
            <h3 class="related-items__title">{t("product.more", locale.value)} {headingSuffix}</h3>
            {/* In-frame: related items switch the panel in place (button + onSelectSku$).
                Route: they navigate (Link). */}
            {/* Related cards reuse the gallery's <ProductCard> so they carry the
                same swatches, colour-name label, logo images and size/variant
                formatting. */}
            <div class="related-items__grid">
              {related.slice(0, 4).map((item, i) => (
                <ProductCard key={item.sku} item={item} sku={item.sku} index={i} onSelect$={inFrame ? props.onSelectSku$ : undefined} />
              ))}
            </div>
            <Carousel.Root class="related-carousel" slidesPerView={relatedPerView.value} gap={0.4} align="start" sensitivity={{ touch: 1.5, mouse: 1.5 }} rewind>
              <div class="related-carousel__wrapper">
                {related.length > relatedPerView.value && (
                <Carousel.Previous class="related-carousel__arrow related-carousel__arrow--prev">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </Carousel.Previous>
                )}
                <Carousel.Scroller class="related-carousel__scroller">
                  {related.map((item, i) => (
                    <Carousel.Slide key={item.sku} class="related-carousel__slide">
                      <ProductCard item={item} sku={item.sku} index={i} onSelect$={inFrame ? props.onSelectSku$ : undefined} />
                    </Carousel.Slide>
                  ))}
                </Carousel.Scroller>
                {related.length > relatedPerView.value && (
                <Carousel.Next class="related-carousel__arrow related-carousel__arrow--next">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </Carousel.Next>
                )}
              </div>
            </Carousel.Root>
          </div>
        );
      })()}
      {/* Kept mounted and toggled by the same `added` state as the button, so its
          fade-out runs on the same clock as the button's logo/glyph/label exit. */}
      <div class={`toast ${added.value ? "toast--show" : ""}`}>{t("modal.added", locale.value)} — {addedInfo.value}</div>
      {imgFullscreen.value && (
        <div class="product-fullscreen" onClick$={() => (imgFullscreen.value = false)}>
          <button class="product-fullscreen__close" aria-label="Close fullscreen" onClick$={(e) => { e.stopPropagation(); imgFullscreen.value = false; }}>&times;</button>
          {logoActive && imgIndex.value < logoDef!.views.length ? (() => {
            const vk = logoDef!.views[imgIndex.value] ?? logoDef!.views[0];
            const viewPos = posForView(vk);
            const showLogo = !!viewPos;
            return (
              <div class="product-fullscreen__logo" onClick$={(e) => e.stopPropagation()}>
                <LogoSlide
                  key={logoColor!.views[vk].src}
                  base={logoColor!.views[vk].src}
                  ar={logoColor!.views[vk].ar}
                  logo={showLogo ? logoAsset(logoColor!, selectedLogoStyle.value) : null}
                  box={showLogo ? logoColor!.boxes[viewPos!.id] : null}
                  active={true}
                  alt={p.name}
                  eager={true}
                />
              </div>
            );
          })() : (
          <img
            src={logoActive ? logoExtraImgs[imgIndex.value - logoDef!.views.length] : (visibleImgs.value)[imgIndex.value]}
            alt={p.name}
            class="product-fullscreen__img"
            onClick$={(e) => e.stopPropagation()}
          />
          )}
        </div>
      )}
    </div>
  );
});
