import { component$, useSignal, useComputed$, useContext } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { allProducts } from "./products";
import type { Product } from "./products";
import { CategoryContext, SearchContext, GenderContext } from "./layout";

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
          <div class="product-card__name">
            <span class="product-card__name-text">{item.name.replace(/#\S+/g, '').trim()}</span>
            <span class="product-card__name-code">{(item.name.match(/#\S+/) || [''])[0]}</span>
          </div>
          <div class="product-card__price-group">
            <div class="product-card__price">${item.price}</div>
            <span class="product-card__sizes">{item.sizes === "One Size" ? t("modal.onesize", locale.value) : item.sizes}</span>
          </div>
        </div>
      </div>
    </a>
  );
});

export default component$(() => {
  const activeCategory = useContext(CategoryContext);
  const searchQuery = useContext(SearchContext);
  const genderFilter = useContext(GenderContext);
  const sortBy = useSignal<SortKey>("popular");

  const filtered = useComputed$(() => {

    const pushLast = (items: typeof allProducts) => {
      const last = items.filter((p) => p.sku === "CAR-12");
      return [...items.filter((p) => p.sku !== "CAR-12"), ...last];
    };
    const filterGender = (items: typeof allProducts) => {
      if (genderFilter.value === "All") return items;
      const prefix = genderFilter.value === "Men" ? "men" : "women";
      return items.filter((p) => p.name.toLowerCase().includes(prefix));
    };

    // Search across all categories
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return filterGender(pushLast(allProducts.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))));
    }

    if (activeCategory.value !== "All") {
      const items = allProducts.filter((p) => p.category === activeCategory.value);
      if (sortBy.value === "name") items.sort((a, b) => a.name.localeCompare(b.name));
      else if (sortBy.value === "newest") items.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
      return filterGender(pushLast(items));
    }
    // Interleave: alternate 1 work wear, 1 other
    const workWear = allProducts.filter((p) => p.category === "Work Wear" && p.sku !== "CAR-12");
    const other = allProducts.filter((p) => p.category !== "Work Wear");
    const result: typeof allProducts = [];
    let w = 0, o = 0;
    while (w < workWear.length || o < other.length) {
      if (o < other.length) result.push(other[o++]);
      if (w < workWear.length) result.push(workWear[w++]);
    }
    if (sortBy.value === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy.value === "newest") result.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    const car12 = allProducts.find((p) => p.sku === "CAR-12");
    if (car12) result.push(car12);
    return filterGender(result);
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
