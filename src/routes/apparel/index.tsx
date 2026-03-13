import { component$, useSignal, useComputed$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

const allProducts = [
  { name: "Classic Green Polo", category: "Polos", sizes: "S - 3XL", badge: "Best Seller", img: "https://images.unsplash.com/photo-1625910513413-5fc89e65cf4e?w=440&h=330&fit=crop" },
  { name: "Performance Polo", category: "Polos", sizes: "S - 2XL", badge: "", img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=440&h=330&fit=crop" },
  { name: "Women's Classic Polo", category: "Polos", sizes: "XS - 2XL", badge: "", img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=440&h=330&fit=crop" },
  { name: "Softshell Jacket", category: "Jackets", sizes: "S - 2XL", badge: "New", img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=440&h=330&fit=crop" },
  { name: "Insulated Parka", category: "Jackets", sizes: "M - 3XL", badge: "", img: "https://images.unsplash.com/photo-1544923246-77307dd270cb?w=440&h=330&fit=crop" },
  { name: "Crew Neck Tee", category: "T-Shirts", sizes: "XS - 3XL", badge: "Staff Pick", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=440&h=330&fit=crop" },
  { name: "Performance Tee", category: "T-Shirts", sizes: "S - 3XL", badge: "", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=440&h=330&fit=crop" },
  { name: "Embroidered Cap", category: "Hats", sizes: "One Size", badge: "Popular", img: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=440&h=330&fit=crop" },
  { name: "Knit Beanie", category: "Hats", sizes: "One Size", badge: "", img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=440&h=330&fit=crop" },
  { name: "Trucker Hat", category: "Hats", sizes: "One Size", badge: "", img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=440&h=330&fit=crop" },
  { name: "Pullover Hoodie", category: "Hoodies", sizes: "S - 3XL", badge: "New", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=440&h=330&fit=crop" },
  { name: "Zip-Up Hoodie", category: "Hoodies", sizes: "S - 2XL", badge: "", img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=440&h=330&fit=crop" },
  { name: "Hi-Vis Safety Vest", category: "Safety", sizes: "S - 5XL", badge: "Required", img: "https://images.unsplash.com/photo-1618517048289-4646b455e281?w=440&h=330&fit=crop" },
  { name: "Safety Rain Jacket", category: "Safety", sizes: "S - 4XL", badge: "", img: "https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?w=440&h=330&fit=crop" },
];

const categories = ["All", "Polos", "T-Shirts", "Jackets", "Hoodies", "Hats", "Safety"];

type SortKey = "popular" | "newest" | "name";

const badgeClass = (badge: string) => {
  if (badge === "New") return "product-card__badge product-card__badge--orange";
  if (badge === "Required") return "product-card__badge product-card__badge--gold";
  return "product-card__badge product-card__badge--green";
};

export default component$(() => {
  const activeCategory = useSignal("All");
  const sortBy = useSignal<SortKey>("popular");

  const filtered = useComputed$(() => {
    const items = activeCategory.value === "All"
      ? [...allProducts]
      : allProducts.filter((p) => p.category === activeCategory.value);

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
            {activeCategory.value === "All" ? "All Apparel" : activeCategory.value}
          </h1>
          <span class="apparel-catalog__count">{filtered.value.length} items</span>
        </div>
        <div class="apparel-catalog__controls">
          <div class="apparel-catalog__chips">
            {categories.map((cat) => (
              <button
                key={cat}
                class={`apparel-catalog__chip ${activeCategory.value === cat ? "active" : ""}`}
                onClick$={() => (activeCategory.value = cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            class="apparel-catalog__sort"
            value={sortBy.value}
            onChange$={(_, el) => (sortBy.value = el.value as SortKey)}
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>
      <div class="apparel-grid">
        {filtered.value.map((item) => (
          <div key={item.name} class="product-card">
            <div class="product-card__image">
              <img src={item.img} alt={item.name} width="440" height="330" />
              <div class="product-card__image-overlay" />
            </div>
            <div class="product-card__info">
              <div class="product-card__category">{item.category}</div>
              <div class="product-card__name">{item.name}</div>
              <div class="product-card__meta">
                <span class="product-card__sizes">{item.sizes}</span>
                {item.badge && <span class={badgeClass(item.badge)}>{item.badge}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Shop Apparel - Carmichael Engineering",
};
