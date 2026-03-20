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
          <div class="product-card__price">${item.price}</div>
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
          <span class="product-card__sizes">{item.sizes === "One Size" ? t("modal.onesize", locale.value) : item.sizes}</span>
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

  const filtered = useComputed$(() => {
    const items = activeCategory.value === "All" ? [...allProducts] : allProducts.filter((p) => p.category === activeCategory.value);

    if (sortBy.value === "name") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy.value === "newest") {
      items.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    }
    return items;
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
