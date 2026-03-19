import { component$, useSignal, useComputed$, useVisibleTask$, $, useContext } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../../i18n";
import { allProducts, expandSizes, colorName, categoryLabel } from "../products";

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loc = useLocation();
  const nav = useNavigate();

  const sku = loc.params.sku;
  const product = useComputed$(() => allProducts.find((p) => p.sku === sku) || null);

  const imgIndex = useSignal(0);
  const touchStartX = useSignal(0);
  const selectedSize = useSignal("");
  const selectedColor = useSignal("");
  const selectedQty = useSignal(1);
  const added = useSignal(false);

  // Set initial color once product is known
  const colorInitialized = useSignal(false);

  // Auto-advance carousel
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const p = product.value;
    if (!p?.imgs || p.imgs.length < 2) return;
    const interval = setInterval(() => {
      imgIndex.value = (imgIndex.value + 1) % p.imgs.length;
    }, 4000);
    cleanup(() => clearInterval(interval));
  });

  const addToCart = $(() => {
    const p = product.value;
    if (!p || !selectedSize.value || !selectedColor.value) return;
    try {
      const saved = localStorage.getItem("ce_cart");
      const items = saved ? JSON.parse(saved) : [];
      const existing = items.find(
        (i: any) => i.name === p.name && i.size === selectedSize.value && i.color === selectedColor.value
      );
      if (existing) {
        existing.quantity += selectedQty.value;
      } else {
        items.push({
          name: p.name,
          sku: p.sku,
          category: p.category,
          size: selectedSize.value,
          color: selectedColor.value,
          quantity: selectedQty.value,
          price: p.price,
          img: p.img,
        });
      }
      localStorage.setItem("ce_cart", JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch { /* ignore */ }
    added.value = true;
    selectedSize.value = "";
    selectedQty.value = 1;
    setTimeout(() => { added.value = false; }, 2000);
  });

  // Initialize color
  if (!colorInitialized.value && product.value) {
    selectedColor.value = product.value.colors[0];
    colorInitialized.value = true;
  }

  if (!product.value) {
    return (
      <div class="apparel-catalog" id="products">
        <div class="product-detail">
          <p style={{ padding: "2rem", textAlign: "center" }}>Product not found.</p>
          <button class="btn btn--primary" onClick$={() => nav("/apparel/")} style={{ margin: "0 auto", display: "block" }}>
            {t("apparel.title", locale.value)}
          </button>
        </div>
      </div>
    );
  }

  const p = product.value;
  const pdf = (p as any).pdf as string | undefined;

  return (
    <div class="apparel-catalog" id="products">
      <div class="product-detail">
        <div class="product-modal__layout">
          <div
            class="product-carousel"
            onTouchStart$={(e) => { touchStartX.value = e.touches[0].clientX; }}
            onTouchEnd$={(e) => {
              const diff = touchStartX.value - e.changedTouches[0].clientX;
              const imgs = p.imgs || [p.img];
              if (Math.abs(diff) > 40) {
                if (diff > 0) {
                  imgIndex.value = (imgIndex.value + 1) % imgs.length;
                } else {
                  imgIndex.value = (imgIndex.value - 1 + imgs.length) % imgs.length;
                }
              }
            }}
          >
            {(p.imgs || [p.img]).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={p.name}
                width="600"
                height="400"
                class={`product-carousel__slide ${imgIndex.value === i ? "active" : ""}`}
              />
            ))}
            {(p.imgs || [p.img]).length > 1 && (
              <div class="product-carousel__indicators">
                {(p.imgs || [p.img]).map((_, i) => (
                  <button
                    key={i}
                    class={`product-carousel__dot ${imgIndex.value === i ? "active" : ""}`}
                    onClick$={() => (imgIndex.value = i)}
                  />
                ))}
              </div>
            )}
            {pdf && (
              <a href={pdf} target="_blank" class="product-modal__pdf">
                {t("product.specsheet.pdf", locale.value)}
              </a>
            )}
          </div>
          <div class="product-modal__breadcrumb">
            <span class="breadcrumb__link" onClick$={() => nav(`/apparel/?category=${p.category}`)}>
              {t("apparel.title", locale.value)}
            </span>
            <span class="breadcrumb__sep">/</span>
            <span>{p.sku}</span>
          </div>
          <div class="product-modal__details">
            <div class="product-card__category product-modal__category">{categoryLabel(p.category, locale.value)}</div>
            <div class="product-modal__name-row">
              <h2 class="product-modal__name">{p.name}</h2>
              <div class="product-modal__price">${p.price}</div>
            </div>
            {p.material && (
              <div class="product-modal__material">
                <strong>{t("modal.material", locale.value)}:</strong> {p.material}
              </div>
            )}
            {p.details && (
              <div class="product-modal__material">
                {p.details}
              </div>
            )}
            <div class="product-modal__field">
              <label class="product-modal__label">{t("modal.size", locale.value)}</label>
              <div class="product-modal__options">
                {expandSizes(p.sizes).map((size) => (
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
            <div class="product-modal__field product-modal__color-qty-row">
              <div class="product-modal__color-group">
                <label class="product-modal__label">{t("modal.color", locale.value)}{selectedColor.value && <span class="product-modal__color-inline"> — {colorName(selectedColor.value, locale.value)}</span>}</label>
                <div class="product-modal__options">
                  {p.colors.map((color) => (
                    <button
                      key={color}
                      class={`product-modal__color ${selectedColor.value === color ? "active" : ""}`}
                      style={{ background: color }}
                      onClick$={() => (selectedColor.value = color)}
                      title={colorName(color, locale.value)}
                    />
                  ))}
                </div>
              </div>
              <div class="product-modal__qty-group">
                <label class="product-modal__label">{t("modal.quantity", locale.value)}</label>
                <div class="product-modal__qty">
                  <button class="product-modal__qty-btn" onClick$={() => { if (selectedQty.value > 1) selectedQty.value--; }}>-</button>
                  <span class="product-modal__qty-val">{selectedQty.value}</span>
                  <button class="product-modal__qty-btn" onClick$={() => (selectedQty.value++)}>+</button>
                </div>
              </div>
            </div>
            <button
              class="btn btn--primary product-modal__add"
              disabled={!selectedSize.value}
              onClick$={addToCart}
            >
              {added.value ? t("modal.added", locale.value) : selectedSize.value ? t("modal.addtocart", locale.value) : t("modal.selectsize", locale.value)}
            </button>
          </div>
        </div>
      </div>
      {added.value && (
        <div class="toast">{t("modal.added", locale.value)}</div>
      )}
    </div>
  );
});

export const head: DocumentHead = ({ params }) => {
  const product = allProducts.find((p) => p.sku === params.sku);
  return {
    title: product ? `${product.name} - Carmichael Engineering` : "Product - Carmichael Engineering",
  };
};
