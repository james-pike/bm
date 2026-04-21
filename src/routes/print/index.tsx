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
  "BMGC-1": "/paxton-black.png",
  "BMGC-2": "/paxton-grey.png",
  "BMGC-3": "/gilliamjacket-black.png",
  "BMGC-4": "/gilliam-black.png",
  "BMGC-5": "/duck-black.png",
  "BMGC-6": "/duckgrey.png",
  "BMGC-7": "/cooler-black.png",
  "BMGC-8": "/backpack-black.png",
};

const CATEGORY_FALLBACK_IMG: Record<string, string> = {
  "Work Wear": "/CTA_en_OurServices_FS_Plumbing-1.webp",
  "Jackets": "/accessories.webp",
  "Accessories": "/CTA_en_OurServices_FS_MSNAD-1.webp",
};

export default component$(() => {
  const onPrint = $(() => window.print());
  return (
    <div class="print-page">
      <div class="print-page__toolbar">
        <h1 class="print-page__heading">Catalog</h1>
        <button class="print-page__btn" onClick$={onPrint}>Download / Print</button>
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
            return (
              <article key={p.sku} class="print-card">
                <div class="print-card__image">
                  <img src={SKU_IMG_OVERRIDE[p.sku] || p.img || CATEGORY_FALLBACK_IMG[p.category] || "/truck2.webp"} alt={p.name} />
                </div>
                <div class="print-card__body">
                  <h3 class="print-card__name">{baseName}</h3>
                  <div class="print-card__meta">
                    {color && <span class={`print-card__cat ${/grey|gray/i.test(color) ? "print-card__cat--grey" : ""}`}>Color: {color}</span>}
                    <span class="print-card__sizes">Sizes: {p.sizes}</span>
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
