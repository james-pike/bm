import { component$, useSignal, useComputed$, useContext } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { allProducts, categories, colorName } from "./products";
import type { Product } from "./products";

type SortKey = "popular" | "newest" | "name";

const ProductCard = component$<{ item: Product; sku: string }>(({ item, sku }) => {
  const locale = useContext(LocaleContext);

  return (
    <a href={`/apparel/${sku}/`} class="product-card product-card-link">
      <div class="product-card__image">
        <img src={item.img} alt={item.name} width="440" height="440" />
      </div>
      <div class="product-card__info">
        <div class="product-card__name-row">
          <div class="product-card__name">{item.name}</div>
          <div class="product-card__price-group">
            <div class="product-card__price">${item.price}</div>
            <span class="product-card__sizes">{item.sizes === "One Size" ? t("modal.onesize", locale.value) : item.sizes}</span>
          </div>
        </div>
        <div class="product-card__color-size-row">
          <div class="product-card__colors">
            {item.colors.map((color) => (
              <span
                key={color}
                class={`product-card__color-dot ${color === "#ffffff" ? "product-card__color-dot--light" : ""}`}
                style={{ background: color }}
                title={colorName(color, locale.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </a>
  );
});

export default component$(() => {
  const loc = useLocation();

  const activeCategory = useComputed$(() => {
    const cat = loc.url.searchParams.get("category") || "All";
    return categories.includes(cat) ? cat : "All";
  });
  const sortBy = useSignal<SortKey>("popular");

  const searchQuery = useComputed$(() => loc.url.searchParams.get("q") || "");

  const filtered = useComputed$(() => {
    // Cross-category mappings: work wear items that also belong in other categories
    const alsoBelongs: Record<string, string[]> = {
      "CAR-9": ["Jackets"],   // Viking Insulated Jacket
      "CAR-13": ["Jackets"],  // Viking 420D Jacket
      "CAR-15": ["Jackets"],  // FR Hoodie
      "CAR-16": ["Polos"],    // FR Long Sleeve Polo
    };

    // Search across all categories
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return allProducts.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (activeCategory.value !== "All") {
      const items = allProducts.filter((p) => p.category === activeCategory.value || (alsoBelongs[p.sku]?.includes(activeCategory.value)));
      if (sortBy.value === "name") items.sort((a, b) => a.name.localeCompare(b.name));
      else if (sortBy.value === "newest") items.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
      return items;
    }
    // Interleave: alternate 1 work wear, 1 other
    const workWear = allProducts.filter((p) => p.category === "Work Wear");
    const other = allProducts.filter((p) => p.category !== "Work Wear");
    const result: typeof allProducts = [];
    let w = 0, o = 0;
    while (w < workWear.length || o < other.length) {
      if (o < other.length) result.push(other[o++]);
      if (w < workWear.length) result.push(workWear[w++]);
    }
    if (sortBy.value === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy.value === "newest") result.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    return result;
  });

  return (
    <div class="apparel-catalog" id="products">
      <div class="apparel-grid">
        {filtered.value.map((item) => (
          <ProductCard key={item.name} item={item} sku={item.sku} />
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Shop Apparel - Carmichael Apparel",
};
