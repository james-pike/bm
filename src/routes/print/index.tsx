import { component$, $ } from "@builder.io/qwik";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { allProducts } from "../apparel/products";

export const usePrintAuthGuard = routeLoader$(({ cookie, redirect }) => {
  const val = cookie.get("ce_auth")?.value;
  if (val !== "clothing" && val !== "tech" && val !== "electrical" && val !== "authenticated") {
    throw redirect(302, "/");
  }
});

const SKU_IMG_OVERRIDE: Record<string, string> = {
  "BMGC-1": "/100617_001_MF25_e_w.png",
  "BMGC-2": "/100617_026_MS25_e.png",
  "BMGC-3": "/102208_001_MF22_V2.png",
  "BMGC-4": "/102286_001_MF22_e_1.png",
  "BMGC-5": "/104277_BLK_MF22_e.png",
  "BMGC-6": "/duckgrey.png",
  "BMGC-7": "/105294_BLK_MF22_e.png",
  "BMGC-8": "/backpack-black.png",
  "BMGC-9": "/cooler-black.png",
};

const CATEGORY_FALLBACK_IMG: Record<string, string> = {
  "Work Wear": "/CTA_en_OurServices_FS_Plumbing-1.webp",
  "Jackets": "/accessories.webp",
  "Accessories": "/CTA_en_OurServices_FS_MSNAD-1.webp",
};

const TALL_SIZES: Record<string, string> = {
  "BMGC-1": "L - 3XL",
  "BMGC-2": "L - 3XL",
  "BMGC-3": "L - 2XL",
  "BMGC-4": "L - 2XL",
  "BMGC-5": "M - 4XL",
  "BMGC-6": "L - 4XL",
  "BMGC-7": "L - 3XL",
};

export default component$(() => {
  const onPrint = $(() => window.print());
  return (
    <div class="print-page">
      <div class="print-page__toolbar">
        <h1 class="print-page__heading">Catalog</h1>
        <button class="print-page__btn" onClick$={onPrint}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Download / Print
        </button>
      </div>
      <div class="print-page__sheet-wrap">
      <div class="print-page__sheet">
        <header class="print-page__header">
          <div class="print-page__cluster">
            <img src="/BlackMcDonald_Logo.webp" alt="Black &amp; McDonald" class="print-page__cluster-img" />
            <div class="print-page__cluster-row">
              <span class="print-page__cluster-text">Good Catch Awards</span>
              <img src="/good-catch-logo-en.jpg" alt="Good Catch Awards" class="print-page__cluster-patch" />
            </div>
          </div>
          <div class="print-page__title-block">
            <h2 class="print-page__title">Good Catch Awards</h2>
          </div>
        </header>
        <div class="print-page__grid">
          {allProducts.filter((p) => p.sku.startsWith("BMGC-")).map((p) => {
            const lastDash = p.name.lastIndexOf(" - ");
            const baseName = lastDash > -1 ? p.name.slice(0, lastDash) : p.name;
            const color = lastDash > -1 ? p.name.slice(lastDash + 3) : "";
            const codeMatch = p.details.match(/#[A-Za-z0-9]+/);
            const itemCode = codeMatch ? codeMatch[0] : "";
            return (
              <article key={p.sku} class="print-card">
                <div class="print-card__image">
                  <img src={SKU_IMG_OVERRIDE[p.sku] || p.img || CATEGORY_FALLBACK_IMG[p.category] || "/truck2.webp"} alt={p.name} />
                </div>
                <div class="print-card__body">
                  <h3 class="print-card__name">{baseName}{itemCode && <span class="print-card__code"> {itemCode}</span>}</h3>
                  <div class="print-card__meta">
                    {color && <span class={`print-card__cat ${/grey|gray/i.test(color) ? "print-card__cat--grey" : ""}`}>Color: {color}</span>}
                    {TALL_SIZES[p.sku] ? (
                      <>
                        <span class="print-card__sizes">Regular: {p.sizes}</span>
                        <span class="print-card__sizes">Tall: {TALL_SIZES[p.sku]}</span>
                      </>
                    ) : (
                      <span class="print-card__sizes">Sizes: {p.sizes}</span>
                    )}
                  </div>
                  <p class="print-card__material">{p.material}</p>
                </div>
              </article>
            );
          })}
        </div>
        <footer class="print-page__footer">
          <span>Black &amp; McDonald — Good Catch Awards</span>
          <span>{new Date().getFullYear()}</span>
        </footer>
      </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Good Catch Awards Catalog",
  meta: [
    { name: "description", content: "Printable Good Catch Awards catalog." },
    { name: "robots", content: "noindex, nofollow" },
  ],
};
