import { component$, useSignal, useComputed$, useVisibleTask$, useContext, type QRL } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { allProducts, categories, badgeMap, badgeClass, colorName, categoryLabel } from "./products";
import type { Product } from "./products";

type SortKey = "popular" | "newest" | "name";

const ProductCard = component$<{ item: Product; onSelect$: QRL<() => void> }>(({ item, onSelect$ }) => {
  const locale = useContext(LocaleContext);
  const imgIndex = useSignal(0);
  const hovering = useSignal(false);
  const imgs = (item as any).imgs as string[] | undefined;
  const pdf = (item as any).pdf as string | undefined;

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    track(() => hovering.value);
    if (!hovering.value || !imgs || imgs.length < 2) {
      imgIndex.value = 0;
      return;
    }
    const interval = setInterval(() => {
      imgIndex.value = (imgIndex.value + 1) % imgs.length;
    }, 2000);
    cleanup(() => clearInterval(interval));
  });

  return (
    <div
      class="product-card"
      onMouseEnter$={() => (hovering.value = true)}
      onMouseLeave$={() => (hovering.value = false)}
      onClick$={(e) => {
        if ((e.target as HTMLElement).closest(".product-card__pdf")) return;
        onSelect$();
      }}
    >
      <div class="product-card__image">
        {imgs && imgs.length > 1 ? (
          imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={item.name}
              width="440"
              height="330"
              class={`product-card__img-slide ${imgIndex.value === i ? "active" : ""}`}
            />
          ))
        ) : (
          <img src={item.img} alt={item.name} width="440" height="330" />
        )}
        <div class="product-card__image-overlay" />
        {imgs && imgs.length > 1 && (
          <div class="product-card__img-dots">
            {imgs.map((_, i) => (
              <span key={i} class={`product-card__img-dot ${imgIndex.value === i ? "active" : ""}`} />
            ))}
          </div>
        )}
      </div>
      <div class="product-card__info">
        <div class="product-card__name-row">
          <div class="product-card__name">{item.name}</div>
          <div class="product-card__price">${item.price}</div>
        </div>
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
        <div class="product-card__meta">
          <span class="product-card__sizes">{item.sizes === "One Size" ? t("modal.onesize", locale.value) : item.sizes}</span>
          <span class="product-card__sku">{item.sku}</span>
          {item.badge && <span class={badgeClass(item.badge)}>{t(badgeMap[item.badge] as any, locale.value)}</span>}
        </div>
        {pdf && (
          <a href={pdf} target="_blank" class="product-card__pdf" onClick$={(e) => e.stopPropagation()}>
            {t("product.specsheet", locale.value)}
          </a>
        )}
      </div>
    </div>
  );
});

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loc = useLocation();
  const nav = useNavigate();

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
      <div class="apparel-catalog__header">
        <div class="apparel-catalog__controls">
          <div class="apparel-catalog__chips">
            {categories.map((cat) => (
              <button
                key={cat}
                class={`apparel-catalog__chip ${activeCategory.value === cat ? "active" : ""}`}
                onClick$={() => nav(`/apparel/?category=${cat}`)}
              >
                {categoryLabel(cat, locale.value)}
              </button>
            ))}
          </div>
          <select
            class="apparel-catalog__sort"
            value={sortBy.value}
            onChange$={(_, el) => (sortBy.value = el.value as SortKey)}
          >
            <option value="popular">{t("apparel.sort.popular", locale.value)}</option>
            <option value="newest">{t("apparel.sort.newest", locale.value)}</option>
            <option value="name">{t("apparel.sort.name", locale.value)}</option>
          </select>
        </div>
      </div>
      <div class="apparel-grid">
        {filtered.value.map((item) => (
          <ProductCard key={item.name} item={item} onSelect$={() => nav(`/apparel/${item.sku}/`)} />
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Shop Apparel - Carmichael Engineering",
};
