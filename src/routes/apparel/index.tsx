import { component$, useSignal, useComputed$, useVisibleTask$, $, useContext, type QRL } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import type { Locale } from "../../i18n";

const allProducts = [
  { sku: "CM-1", name: "UA Men's Tech Polo", category: "Polos", sizes: "S - 4XL", badge: "", colors: ["#1a1a18", "#94a3b8"], price: 60, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=440&h=330&fit=crop", material: "100% polyester", details: "Moisture-wicking, anti-odor technology, textured soft & breathable fabric, self-fabric collar, 3-button placket" },
  { sku: "CM-2", name: "Men's Snag Resistant Polo", category: "Polos", sizes: "XS - 4XL", badge: "", colors: ["#1a1a18", "#94a3b8"], price: 40, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=440&h=330&fit=crop", material: "100% performance polyester micropique", details: "Snag resistant, moisture-wicking, breathable, tagless, rib knit collar, classic fit" },
  { sku: "CM-5", name: "Men's Soft Shell Jacket", category: "Jackets", sizes: "XS - 4XL", badge: "", colors: ["#1a1a18", "#4a4a4a", "#2c3e50"], price: 68, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=440&h=330&fit=crop", material: "100% polyester with mechanical stretch, bonded micro fleece lining", details: "Water repellent, wind resistant, anti-pill, YKK zippers, 1000mm waterproof rating, classic fit" },
  { sku: "CM-6", name: "Women's Soft Shell Jacket", category: "Jackets", sizes: "XS - 4XL", badge: "", colors: ["#1a1a18", "#4a4a4a", "#2c3e50"], price: 68, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=440&h=330&fit=crop", material: "100% polyester with mechanical stretch, bonded micro fleece lining", details: "Water repellent, wind resistant, anti-pill, YKK zippers, 1000mm waterproof rating, classic fit" },
  { sku: "CM-7", name: "Women's Golf Polo", category: "Polos", sizes: "XS - 4XL", badge: "", colors: ["#1a1a18", "#00703c", "#94a3b8"], price: 40, img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=440&h=330&fit=crop", material: "100% performance polyester micropique", details: "Snag resistant, moisture-wicking, breathable, tagless, self-fabric collar, relaxed fit" },
  { sku: "CM-10", name: "Men's Alpine Fleece", category: "Jackets", sizes: "XS - 4XL", badge: "New", colors: ["#1a1a18", "#2c3e50", "#4a4a4a"], price: 120, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=440&h=330&fit=crop", material: "60% Cotton / 40% Acrylic", details: "Full zip, heavyweight cuffs & hem, stand-up collar, long sleeves, FW branded zipper pull" },
  { sku: "CM-11", name: "Women's Alpine Fleece", category: "Jackets", sizes: "XS - 3XL", badge: "New", colors: ["#1a1a18", "#2c3e50", "#4a4a4a"], price: 120, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=440&h=330&fit=crop", material: "60% Cotton / 40% Acrylic", details: "Full zip, heavyweight cuffs & hem, stand-up collar, long sleeves, FW branded zipper pull" },
  { sku: "CM-12", name: "Carmichael Flip Toque", category: "Caps", sizes: "One Size", badge: "", colors: ["#1a1a18", "#2c3e50", "#4a4a4a"], price: 7, img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=440&h=330&fit=crop", material: "100% Acrylic", details: "Traditional knit hat with cuff, one size fits most" },
  { sku: "CM-13", name: "Embroidered Cap", category: "Caps", sizes: "One Size", badge: "Popular", colors: ["#00703c", "#1a1a18", "#2c3e50"], price: 24, img: "/hat/30109107PS2_FRONT.JPG", imgs: ["/hat/30109107PS2_FRONT.JPG", "/hat/30109107PS2_BACK.JPG"], pdf: "/hat/30131741.pdf", material: "", details: "" },
];

const categories = ["Polos", "Jackets", "Caps"];

type SortKey = "popular" | "newest" | "name";


const badgeMap: Record<string, string> = {
  "Best Seller": "badge.bestseller",
  "New": "badge.new",
  "Staff Pick": "badge.staffpick",
  "Popular": "badge.popular",
  "Required": "badge.required",
};

const badgeClassMap: Record<string, string> = {
  "New": "product-card__badge product-card__badge--orange",
  "Required": "product-card__badge product-card__badge--gold",
};

const badgeClass = (badge: string) => badgeClassMap[badge] || "product-card__badge product-card__badge--green";

const expandSizes = (sizeRange: string): string[] => {
  const all = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  if (sizeRange === "One Size") return ["One Size"];
  const parts = sizeRange.split(" - ").map((s) => s.trim());
  const start = all.indexOf(parts[0]);
  const end = all.indexOf(parts[1]);
  if (start === -1 || end === -1) return [sizeRange];
  return all.slice(start, end + 1);
};

const colorKeyMap: Record<string, string> = {
  "#00703c": "color.green",
  "#1a1a18": "color.black",
  "#ffffff": "color.white",
  "#2c3e50": "color.navy",
  "#94a3b8": "color.grey",
  "#E6570C": "color.orange",
  "#e4ba3f": "color.yellow",
};

const colorName = (hex: string, locale: Locale): string => {
  const key = colorKeyMap[hex];
  if (key) return t(key as any, locale);
  return hex;
};

const categoryLabel = (cat: string, locale: Locale): string => {
  if (cat === "All") return t("apparel.all", locale);
  const key = `cat.${cat}` as any;
  return t(key, locale);
};

const ProductCard = component$<{ item: typeof allProducts[0]; onSelect$: QRL<() => void> }>(({ item, onSelect$ }) => {
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
        <div class="product-card__category">{item.sku}</div>
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
    const cat = loc.url.searchParams.get("category") || "Polos";
    return categories.includes(cat) ? cat : "Polos";
  });
  const sortBy = useSignal<SortKey>("popular");

  // Product modal
  const selectedProduct = useSignal<typeof allProducts[0] | null>(null);
  const selectedSize = useSignal("");
  const selectedColor = useSignal("");
  const selectedQty = useSignal(1);

  const openProduct = $((item: typeof allProducts[0]) => {
    selectedProduct.value = item;
    selectedSize.value = "";
    selectedColor.value = item.colors[0];
    selectedQty.value = 1;
  });

  const addToCart = $(() => {
    if (!selectedProduct.value || !selectedSize.value || !selectedColor.value) return;
    try {
      const saved = localStorage.getItem("ce_cart");
      const items = saved ? JSON.parse(saved) : [];
      const existing = items.find(
        (i: any) => i.name === selectedProduct.value!.name && i.size === selectedSize.value && i.color === selectedColor.value
      );
      if (existing) {
        existing.quantity += selectedQty.value;
      } else {
        items.push({
          name: selectedProduct.value.name,
          category: selectedProduct.value.category,
          size: selectedSize.value,
          color: selectedColor.value,
          quantity: selectedQty.value,
          price: selectedProduct.value.price,
          img: selectedProduct.value.img,
        });
      }
      localStorage.setItem("ce_cart", JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch { /* ignore */ }
    selectedProduct.value = null;
  });

  const filtered = useComputed$(() => {
    const items = allProducts.filter((p) => p.category === activeCategory.value);

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
        <div class="apparel-catalog__title-row">
          <h1 class="apparel-catalog__title">
            {categoryLabel(activeCategory.value, locale.value)}
          </h1>
          <span class="apparel-catalog__count">{filtered.value.length} {t("apparel.items", locale.value)}</span>
        </div>
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
          <ProductCard key={item.name} item={item} onSelect$={() => openProduct(item)} />
        ))}
      </div>

      {/* Product Modal */}
      {selectedProduct.value && (
        <div class="modal-overlay" onClick$={() => (selectedProduct.value = null)}>
          <div class="modal product-modal" onClick$={(e) => e.stopPropagation()}>
            <button class="modal__close" onClick$={() => (selectedProduct.value = null)}>x</button>
            <div class="product-modal__layout">
              <div class="product-modal__image">
                <img src={selectedProduct.value.img} alt={selectedProduct.value.name} width="440" height="330" />
                {(selectedProduct.value as any).pdf && (
                  <a href={(selectedProduct.value as any).pdf} target="_blank" class="product-modal__pdf">
                    {t("product.specsheet.pdf", locale.value)}
                  </a>
                )}
              </div>
              <div class="product-modal__details">
                <div class="product-card__category product-modal__category">{categoryLabel(selectedProduct.value.category, locale.value)}</div>
                <h2 class="product-modal__name">{selectedProduct.value.name}</h2>
                <div class="product-modal__price">${selectedProduct.value.price}</div>
                {selectedProduct.value.material && (
                  <div class="product-modal__material">
                    <strong>{t("modal.material", locale.value)}:</strong> {selectedProduct.value.material}
                  </div>
                )}
                {selectedProduct.value.details && (
                  <div class="product-modal__material">
                    {selectedProduct.value.details}
                  </div>
                )}
                <div class="product-modal__field">
                  <label class="product-modal__label">{t("modal.size", locale.value)}</label>
                  <div class="product-modal__options">
                    {expandSizes(selectedProduct.value.sizes).map((size) => (
                      <button
                        key={size}
                        class={`product-modal__option ${selectedSize.value === size ? "active" : ""}`}
                        onClick$={() => (selectedSize.value = size)}
                      >
                        {size === "One Size" ? t("modal.onesize", locale.value) : size}
                      </button>
                    ))}
                  </div>
                </div>
                <div class="product-modal__field">
                  <label class="product-modal__label">{t("modal.color", locale.value)}</label>
                  <div class="product-modal__options">
                    {selectedProduct.value.colors.map((color) => (
                      <button
                        key={color}
                        class={`product-modal__color ${selectedColor.value === color ? "active" : ""}`}
                        style={{ background: color }}
                        onClick$={() => (selectedColor.value = color)}
                        title={colorName(color, locale.value)}
                      />
                    ))}
                  </div>
                  {selectedColor.value && <span class="product-modal__color-label">{colorName(selectedColor.value, locale.value)}</span>}
                </div>
                <div class="product-modal__field">
                  <label class="product-modal__label">{t("modal.quantity", locale.value)}</label>
                  <div class="product-modal__qty">
                    <button class="product-modal__qty-btn" onClick$={() => { if (selectedQty.value > 1) selectedQty.value--; }}>-</button>
                    <span class="product-modal__qty-val">{selectedQty.value}</span>
                    <button class="product-modal__qty-btn" onClick$={() => (selectedQty.value++)}>+</button>
                  </div>
                </div>
                <button
                  class="btn btn--primary product-modal__add"
                  disabled={!selectedSize.value}
                  onClick$={addToCart}
                >
                  {selectedSize.value ? t("modal.addtocart", locale.value) : t("modal.selectsize", locale.value)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
});

export const head: DocumentHead = {
  title: "Shop Apparel - Carmichael Engineering",
};
