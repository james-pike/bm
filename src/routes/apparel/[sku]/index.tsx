import { component$, useSignal, useComputed$, useVisibleTask$, $, useContext } from "@builder.io/qwik";
import { Modal } from '@qwik-ui/headless';
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../../i18n";
import { allProducts, colorName, categoryLabel } from "../products";
import { expandSizes } from "../utils";

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
  const addedInfo = useSignal("");
  const imgFullscreen = useSignal(false);
  const userSelectedImg = useSignal(false);

  // Set initial color once product is known
  const colorInitialized = useSignal(false);

  // Auto-advance carousel (stops when user selects an image)
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    track(() => userSelectedImg.value);
    if (userSelectedImg.value) return;
    const p = product.value;
    if (!p?.imgs || p.imgs.length < 2) return;
    const interval = setInterval(() => {
      imgIndex.value = (imgIndex.value + 1) % p.imgs.length;
    }, 6000);
    cleanup(() => clearInterval(interval));
  });

  const addToCart = $(() => {
    const p = product.value;
    console.log("addToCart called", { p: p?.name, size: selectedSize.value, color: selectedColor.value });
    if (!p || !selectedSize.value) return;
    if (p.colors.length > 0 && !selectedColor.value) return;
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
      console.log("cart saved, dispatching event", items.length, "items");
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) { console.error("addToCart error:", err); }
    addedInfo.value = `${p.name} — ${colorName(selectedColor.value, "en")} / ${selectedSize.value}`;
    added.value = true;
    selectedQty.value = 1;
    setTimeout(() => { added.value = false; }, 3800);
  });

  const orderNow = $(() => {
    const p = product.value;
    if (!p || !selectedSize.value) return;
    if (p.colors.length > 0 && !selectedColor.value) return;
    try {
      const saved = localStorage.getItem("ce_cart");
      const items = saved ? JSON.parse(saved) : [];
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
      localStorage.setItem("ce_cart", JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("cart-updated"));
      window.dispatchEvent(new CustomEvent("open-cart"));
    } catch { /* ignore */ }
  });

  // Initialize color and auto-select default size (prefer M)
  if (!colorInitialized.value && product.value) {
    selectedColor.value = product.value.colors[0];
    const sizes = expandSizes(product.value.sizes);
    const lIdx = sizes.indexOf("L");
    selectedSize.value = lIdx !== -1 ? sizes[lIdx] : sizes[0];
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
          <div class="product-image-row">
            <div
              class="product-carousel"
              onTouchStart$={(e) => { touchStartX.value = e.touches[0].clientX; }}
              onTouchEnd$={(e) => {
                const diff = touchStartX.value - e.changedTouches[0].clientX;
                const imgs = p.imgs || [p.img];
                if (Math.abs(diff) > 40) {
                  userSelectedImg.value = true;
                  if (diff > 0) {
                    imgIndex.value = (imgIndex.value + 1) % imgs.length;
                  } else {
                    imgIndex.value = (imgIndex.value - 1 + imgs.length) % imgs.length;
                  }
                }
              }}
              onClick$={() => { imgFullscreen.value = true; }}
            >
              {(p.imgs || [p.img]).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={p.name}
                  width="600"
                  height="400"
                  class={`product-carousel__slide ${imgIndex.value === i ? "active" : ""} ${src.includes("spec") ? "product-carousel__slide--contain" : ""}`}
                  style={src.includes("BACK") ? { objectPosition: "center 65%" } : {}}
                />
              ))}
              {pdf && (
                <a href={pdf} target="_blank" class="product-modal__pdf" onClick$={(e) => e.stopPropagation()}>
                  {t("product.specsheet.pdf", locale.value)}
                </a>
              )}
            </div>
            {(p.imgs || [p.img]).length > 1 && (
              <div class="product-thumbs product-thumbs--column">
                {(p.imgs || [p.img]).map((src, i) => (
                  <button
                    key={i}
                    class={`product-thumbs__item ${imgIndex.value === i ? "active" : ""}`}
                    onClick$={() => { imgIndex.value = i; userSelectedImg.value = true; }}
                  >
                    <img src={src} alt={`${p.name} ${i + 1}`} width="80" height="80" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div class="product-modal__breadcrumb">
            <span class="breadcrumb__link" onClick$={() => nav(`/apparel/?category=${p.category}`)}>
              {categoryLabel(p.category, locale.value)}
            </span>
            <span class="breadcrumb__sep">/</span>
            <span class="breadcrumb__sku">{p.sku}</span>
          </div>
          <div class="product-modal__details">
            <div class="product-card__category product-modal__category">{categoryLabel(p.category, locale.value)}</div>
            <h2 class="product-modal__name">{p.name}</h2>
            <div class="product-modal__price">${p.price}</div>
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
              {p.colors.length > 0 && (
                <div class="product-modal__color-group">
                  <label class="product-modal__label">{t("modal.color", locale.value)}{selectedColor.value && <span class="product-modal__color-inline"> — {colorName(selectedColor.value, locale.value)}</span>}</label>
                  <div class="product-modal__options">
                    {p.colors.map((color) => (
                      <button
                        key={color}
                        class={`product-modal__color ${selectedColor.value === color ? "active" : ""}`}
                        style={{ background: color }}
                        onClick$={() => (selectedColor.value = color)}
                        aria-label={colorName(color, locale.value)}
                        title={colorName(color, locale.value)}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div class="product-modal__qty-group">
                <label class="product-modal__label">{t("modal.quantity", locale.value)}</label>
                <div class="product-modal__qty">
                  <button class="product-modal__qty-btn" aria-label="Decrease quantity" onClick$={() => { if (selectedQty.value > 1) selectedQty.value--; }}>-</button>
                  <span class="product-modal__qty-val">{selectedQty.value}</span>
                  <button class="product-modal__qty-btn" aria-label="Increase quantity" onClick$={() => (selectedQty.value++)}>+</button>
                </div>
              </div>
            </div>
            <div class="product-modal__actions">
              <button
                class="btn btn--primary product-modal__add"
                disabled={!selectedSize.value}
                onClick$={addToCart}
              >
                {added.value ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                )}
                {added.value ? t("modal.added", locale.value) : selectedSize.value ? t("modal.addtocart", locale.value) : t("modal.selectsize", locale.value)}
              </button>
              <button
                class="btn btn--secondary product-modal__add"
                disabled={!selectedSize.value}
                onClick$={orderNow}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                {t("modal.ordernow", locale.value)}
              </button>
            </div>
          </div>
        </div>
      </div>
      {(() => {
        const related = allProducts.filter((r) => r.sku !== p.sku && r.sku !== "CAR-12" && r.category === p.category).slice(0, 4);
        return (
          <div class="related-items">
            <h3 class="related-items__title">More {categoryLabel(p.category, locale.value)}</h3>
            <div class="related-items__grid">
              {related.map((item) => (
                <a key={item.sku} href={`/apparel/${item.sku}/`} class="product-card product-card-link">
                  <div class="product-card__image">
                    <img src={item.img} alt={item.name} width="440" height="440" loading="eager" decoding="async" />
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
              ))}
            </div>
          </div>
        );
      })()}
      {added.value && (
        <div class="toast">{t("modal.added", locale.value)} — {addedInfo.value}</div>
      )}
      <Modal.Root bind:show={imgFullscreen} closeOnBackdropClick={true}>
        <Modal.Panel
          class="product-fullscreen"
          onTouchStart$={(e: TouchEvent) => { touchStartX.value = e.touches[0].clientX; }}
          onTouchEnd$={(e: TouchEvent) => {
            const diff = touchStartX.value - e.changedTouches[0].clientX;
            const imgs = p.imgs || [p.img];
            if (Math.abs(diff) > 40 && imgs.length > 1) {
              e.stopPropagation();
              if (diff > 0) {
                imgIndex.value = (imgIndex.value + 1) % imgs.length;
              } else {
                imgIndex.value = (imgIndex.value - 1 + imgs.length) % imgs.length;
              }
            }
          }}
        >
          <button class="product-fullscreen__close" aria-label="Close fullscreen" onClick$={() => { imgFullscreen.value = false; }}>&times;</button>
          <img
            src={(p.imgs || [p.img])[imgIndex.value]}
            alt={p.name}
            class="product-fullscreen__img"
          />
          {(p.imgs || [p.img]).length > 1 && (
            <div class="product-fullscreen__nav">
              <button aria-label="Previous image" onClick$={(e) => { e.stopPropagation(); imgIndex.value = (imgIndex.value - 1 + (p.imgs || [p.img]).length) % (p.imgs || [p.img]).length; }}>&lsaquo;</button>
              <button aria-label="Next image" onClick$={(e) => { e.stopPropagation(); imgIndex.value = (imgIndex.value + 1) % (p.imgs || [p.img]).length; }}>&rsaquo;</button>
            </div>
          )}
        </Modal.Panel>
      </Modal.Root>
    </div>
  );
});

export const head: DocumentHead = ({ params }) => {
  const product = allProducts.find((p) => p.sku === params.sku);
  return {
    title: product ? `${product.name} - Carmichael Apparel` : "Product - Carmichael Apparel",
  };
};
