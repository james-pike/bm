import { component$, Slot, useSignal, useVisibleTask$, $, useContextProvider, useStore, useComputed$ } from "@builder.io/qwik";
import {
  Link,
  routeAction$,
  routeLoader$,
  useLocation,
  Form,
  z,
  zod$,
} from "@builder.io/qwik-city";
import type { Cookie } from "@builder.io/qwik-city";
import { Resend } from "resend";
import { LocaleContext, t } from "../i18n";
import type { Locale, TranslationKey } from "../i18n";

const AUTH_COOKIE = "ce_auth";
const LOCALE_COOKIE = "ce_locale";

export const useLocaleLoader = routeLoader$(({ cookie }) => {
  const saved = cookie.get(LOCALE_COOKIE)?.value;
  return (saved === "fr" ? "fr" : "en") as Locale;
});

function isAuthenticated(cookie: Cookie): boolean {
  return cookie.get(AUTH_COOKIE)?.value === "authenticated";
}

export const useAuthCheck = routeLoader$(({ cookie }) => {
  return { loggedIn: isAuthenticated(cookie) };
});

export const useLogin = routeAction$(
  ({ username, password }, { cookie, fail }) => {
    if (username === "admin" && password === "CARMICHAEL") {
      cookie.set(AUTH_COOKIE, "authenticated", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return { success: true };
    }
    return fail(401, { message: "Invalid username or password" });
  },
  zod$({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
);

export const useLogout = routeAction$(async (_, { cookie }) => {
  cookie.delete(AUTH_COOKIE, { path: "/" });
  return { success: true };
});

export const useSubmitOrder = routeAction$(async (data, { fail, env }) => {
  const apiKey = env.get("RESEND_API_KEY");
  if (!apiKey) {
    return fail(500, { message: "Email service not configured" });
  }

  const { employee, items, date } = data as {
    employee: { number: string; name: string; department: string };
    items: { name: string; color: string; size: string; quantity: number; price: number }[];
    date: string;
  };

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0);

  const itemRows = items.map((i) =>
    `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${i.color} / ${i.size}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">$${(Number(i.price) || 0) * i.quantity}</td>
    </tr>`
  ).join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a3a28;padding:20px 24px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">Carmichael Engineering — Apparel Order</h1>
      </div>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 4px"><strong>Date:</strong> ${date}</p>
        <p style="margin:0 0 4px"><strong>Employee:</strong> ${employee.name}</p>
        <p style="margin:0 0 4px"><strong>Employee #:</strong> ${employee.number}</p>
        ${employee.department ? `<p style="margin:0 0 4px"><strong>Department / Site:</strong> ${employee.department}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:8px 12px;text-align:left">Product</th>
              <th style="padding:8px 12px;text-align:left">Details</th>
              <th style="padding:8px 12px;text-align:center">Qty</th>
              <th style="padding:8px 12px;text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:10px 12px;text-align:right;font-weight:700">Total</td>
              <td style="padding:10px 12px;text-align:right;font-weight:700;color:#00703c">$${total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "Carmichael Apparel <orders@carmichaelengineering.com>",
      to: ["jamesandrewpike@gmail.com"],
      subject: `Apparel Order — ${employee.name} (${employee.number}) — ${date}`,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("Failed to send order email:", err);
    return fail(500, { message: "Failed to send order email" });
  }
});

interface CartItem {
  name: string;
  sku: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  img: string;
}

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
  if (key) return t(key as TranslationKey, locale);
  return hex;
};

export default component$(() => {
  const loc = useLocation();
  const auth = useAuthCheck();
  const loginAction = useLogin();
  const orderAction = useSubmitOrder();

  const showLogin = useSignal(false);
  const overlayFading = useSignal(false);
  const savedLocale = useLocaleLoader();
  const locale = useSignal<Locale>(savedLocale.value);

  useContextProvider(LocaleContext, locale);

  // Cart state
  const cart = useStore<{ items: CartItem[] }>({ items: [] });
  const cartOpen = useSignal(false);
  const orderSubmitted = useSignal(false);
  const formError = useSignal("");
  const formTouched = useSignal(false);
  const empNumber = useSignal("");
  const empName = useSignal("");
  const empDept = useSignal("");

  const cartCount = useComputed$(() => cart.items.reduce((sum, i) => sum + i.quantity, 0));

  const toggleLocale = $(() => {
    locale.value = locale.value === "en" ? "fr" : "en";
    document.cookie = `${LOCALE_COOKIE}=${locale.value};path=/;max-age=31536000`;
  });

  const darkHeader = useSignal(false);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const saved = localStorage.getItem("ce_dark_header");
    if (saved === "1") darkHeader.value = true;
  });
  const toggleDarkHeader = $(() => {
    darkHeader.value = !darkHeader.value;
    localStorage.setItem("ce_dark_header", darkHeader.value ? "1" : "0");
  });

  // Load cart from localStorage
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const loadCart = () => {
      try {
        const saved = localStorage.getItem("ce_cart");
        if (saved) {
          cart.items = JSON.parse(saved) as CartItem[];
        } else {
          cart.items = [];
        }
      } catch { cart.items = []; }
    };
    loadCart();
    window.addEventListener("cart-updated", loadCart);
    cleanup(() => window.removeEventListener("cart-updated", loadCart));
  });

  const saveCart = $(() => {
    try {
      localStorage.setItem("ce_cart", JSON.stringify(cart.items));
    } catch { /* ignore */ }
  });

  const removeFromCart = $(async (index: number) => {
    cart.items = cart.items.filter((_, i) => i !== index);
    await saveCart();
    window.dispatchEvent(new CustomEvent("cart-updated"));
  });

  const updateQty = $(async (index: number, delta: number) => {
    const newQty = cart.items[index].quantity + delta;
    if (newQty < 1) return;
    cart.items = cart.items.map((item, i) => i === index ? { ...item, quantity: newQty } : item);
    await saveCart();
    window.dispatchEvent(new CustomEvent("cart-updated"));
  });

  const submitOrder = $(async () => {
    formTouched.value = true;
    if (!empNumber.value || !empName.value || !empDept.value) {
      formError.value = t("cart.error.required", locale.value);
      const details = document.querySelector('.cart-drawer__checkout') as HTMLDetailsElement;
      if (details && !details.open) details.open = true;
      return;
    }
    formError.value = "";

    const orderData = {
      employee: { number: empNumber.value, name: empName.value, department: empDept.value },
      items: cart.items.map((i) => ({
        name: i.name, color: i.color, size: i.size,
        quantity: i.quantity, price: i.price,
      })),
      date: new Date().toLocaleDateString("en-CA"),
    };

    // Send email via server action
    await orderAction.submit(orderData);

    cart.items = [];
    await saveCart();
    window.dispatchEvent(new CustomEvent("cart-updated"));
    orderSubmitted.value = true;
    cartOpen.value = false;
    empNumber.value = "";
    empName.value = "";
    formTouched.value = false;
    empDept.value = "";
  });


  // Listen for open-cart events from child pages
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const handler = () => { cartOpen.value = true; };
    window.addEventListener("open-cart", handler);
    cleanup(() => window.removeEventListener("open-cart", handler));
  });

  // Close cart on navigation
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => loc.url.pathname);
    cartOpen.value = false;
  });

  // Lock scroll when cart is open
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => cartOpen.value);
    const v = cartOpen.value ? "hidden" : "";
    document.documentElement.style.overflow = v;
    document.body.style.overflow = v;
  });

  // Auto-open login modal and lock scroll for unauthenticated users
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!auth.value.loggedIn) {
      showLogin.value = true;
      document.documentElement.style.overflow = "hidden";
    }
  });

  // Close modal and unlock scroll on successful login
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => loginAction.value);
    if (loginAction.value && !loginAction.value.failed) {
      overlayFading.value = true;
      document.documentElement.style.overflow = "";
      setTimeout(() => {
        showLogin.value = false;
        overlayFading.value = false;
      }, 800);
    }
  });

  return (
    <>
      <header class={`site-header ${loc.url.pathname === "/" ? "site-header--transparent" : ""} ${darkHeader.value && loc.url.pathname !== "/" ? "site-header--dark" : ""}`}>
        <div class="site-header__inner">
          <Link href="/" class="site-header__logo">
            <img
              src="/carmichael_logo-removebg-preview (1).png"
              alt="Carmichael Engineering"
              class="site-header__logo-img"
            />
          </Link>
          <nav class="site-header__categories">
            <Link href="/" class={loc.url.pathname === "/" ? "active" : ""}>{t("nav.home", locale.value)}</Link>
            <Link href="/apparel/?category=Polos">{t("nav.polos", locale.value)}</Link>
            <Link href="/apparel/?category=Jackets">{t("nav.jackets", locale.value)}</Link>
            <Link href="/apparel/?category=Hats">{t("nav.hats", locale.value)}</Link>
          </nav>
          <nav class="site-header__nav">
            <button class="locale-btn" onClick$={toggleLocale} aria-label="Toggle language">
              <span class="locale-btn__full">{locale.value === "en" ? "Français" : "English"}</span>
              <span class="locale-btn__short">{locale.value === "en" ? "FR" : "EN"}</span>
            </button>
            <button class="theme-toggle" onClick$={toggleDarkHeader} aria-label="Toggle header theme">
              {darkHeader.value ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>
            <button class={`cart-btn ${cartCount.value > 0 ? "cart-btn--active" : ""}`} onClick$={() => { cartOpen.value = !cartOpen.value; }}>
              {cartOpen.value ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              ) : (
                <>
                  <span class="cart-btn__label">{t("cart.mycart", locale.value)}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                  {cartCount.value > 0 && <span class="cart-btn__dot" />}
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin.value && (
        <div class={`login-overlay ${overlayFading.value ? "login-overlay--fading" : ""}`} onClick$={() => { if (auth.value.loggedIn) showLogin.value = false; }}>
          <div class="login-modal" onClick$={(e) => e.stopPropagation()}>
            {auth.value.loggedIn && (
              <button
                class="login-modal__close"
                onClick$={() => (showLogin.value = false)}
                aria-label="Close"
              >
                &times;
              </button>
            )}
            <div class="login-modal__header">
              <img
                src="/carmichael_logo-removebg-preview (1).png"
                alt="Carmichael Engineering"
                class="login-modal__logo"
              />
              <h2 class="login-modal__title">{t("login.title", locale.value)}</h2>
              <p class="login-modal__subtitle">
                {t("login.subtitle", locale.value)}
              </p>
            </div>
            <Form action={loginAction} class="login-modal__form">
              {loginAction.value?.failed && (
                <div class="login-modal__error">
                  {loginAction.value.fieldErrors?.username ||
                    loginAction.value.fieldErrors?.password ||
                    t("login.error", locale.value)}
                </div>
              )}
              <div class="login-modal__field">
                <label for="username">{t("login.username", locale.value)}</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder={t("login.username.placeholder", locale.value)}
                />
              </div>
              <div class="login-modal__field">
                <label for="password">{t("login.password", locale.value)}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder={t("login.password.placeholder", locale.value)}
                />
              </div>
              <button type="submit" class="btn btn--green login-modal__submit">
                {loginAction.isRunning ? t("login.submitting", locale.value) : t("login.submit", locale.value)}
              </button>
            </Form>
          </div>
        </div>
      )}

      <main>
        <Slot />
      </main>

      {/* Cart Drawer */}
      {cartOpen.value && (
        <div class="modal-overlay" onClick$={() => (cartOpen.value = false)}>
          <div class="drawer cart-drawer" onClick$={(e) => e.stopPropagation()}>
            <div class="cart-drawer__header">
              <h2 class="cart-drawer__title">{t("cart.title", locale.value)} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg></h2>
              <button class="modal__close cart-drawer__close-desktop" onClick$={() => (cartOpen.value = false)}>x</button>
            </div>
            {cart.items.length === 0 ? (
              <p class="cart-drawer__empty">{t("cart.empty", locale.value)}</p>
            ) : (
              <>
                <div class="cart-drawer__items">
                  <table class="cart-table">
                    <thead>
                      <tr>
                        <th class="cart-table__th-product">{t("cart.invoice.product", locale.value)}</th>
                        <th class="cart-table__th-qty">{t("cart.invoice.qty", locale.value)}</th>
                        <th class="cart-table__th-total">{t("cart.invoice.total", locale.value)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item, i) => (
                        <tr key={`${item.name}-${item.size}-${item.color}-${i}`}>
                          <td class="cart-table__product">
                            <div class="cart-table__product-row">
                            <img src={item.img} alt={item.name} width="40" height="30" class="cart-table__img" />
                            <div>
                            <Link href={item.sku ? `/apparel/${item.sku}/` : "/apparel/"} class="cart-table__name-link">{item.name}</Link>
                            <div class="cart-table__meta">
                              {colorName(item.color, locale.value)} / {item.size}                              <button class="cart-table__remove" onClick$={() => removeFromCart(i)}>&times;</button>
                            </div>
                            </div>
                            </div>
                          </td>
                          <td class="cart-table__qty">
                            <div class="cart-table__qty-controls">
                              <button class="cart-table__qty-btn" onClick$={() => updateQty(i, -1)}>-</button>
                              <span>{item.quantity}</span>
                              <button class="cart-table__qty-btn" onClick$={() => updateQty(i, 1)}>+</button>
                            </div>
                          </td>
                          <td class="cart-table__total">${(Number(item.price) || 0) * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} class="cart-table__subtotal-label">{t("cart.invoice.subtotal", locale.value)}</td>
                        <td class="cart-table__subtotal-val">${cart.items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <details class="cart-drawer__checkout">
                  <summary class="cart-drawer__checkout-title">{t("cart.orderdetails", locale.value)}</summary>
                  {formError.value && (
                    <div class="cart-drawer__error">{formError.value}</div>
                  )}
                  <div class="checkout-modal__row">
                    <div class={`checkout-modal__field ${formTouched.value && !empNumber.value ? "checkout-modal__field--error" : ""}`}>
                      <label>{t("cart.empnumber", locale.value)}</label>
                      <input
                        type="text"
                        value={empNumber.value}
                        onInput$={(_, el) => { empNumber.value = el.value; formError.value = ""; }}
                      />
                    </div>
                    <div class={`checkout-modal__field ${formTouched.value && !empName.value ? "checkout-modal__field--error" : ""}`}>
                      <label>{t("cart.fullname", locale.value)}</label>
                      <input
                        type="text"
                        value={empName.value}
                        onInput$={(_, el) => { empName.value = el.value; formError.value = ""; }}
                      />
                    </div>
                  </div>
                  <div class={`checkout-modal__field ${formTouched.value && !empDept.value ? "checkout-modal__field--error" : ""}`}>
                    <label>{t("cart.department", locale.value)}</label>
                    <input
                      type="text"
                      value={empDept.value}
                      onInput$={(_, el) => (empDept.value = el.value)}
                    />
                  </div>
                </details>
                <div class="cart-drawer__footer">
                  <span class="cart-drawer__total">
                    {cartCount.value} {cartCount.value !== 1 ? t("cart.items", locale.value) : t("cart.item", locale.value)} — ${cart.items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0)}
                  </span>
                  <button
                    class="btn btn--primary cart-drawer__order-btn"
                    onClick$={submitOrder}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    {t("cart.createorder", locale.value)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmation */}
      {orderSubmitted.value && (
        <div class="modal-overlay" onClick$={() => (orderSubmitted.value = false)}>
          <div class="modal order-confirm" onClick$={(e) => e.stopPropagation()}>
            <h2 class="order-confirm__title">{t("order.title", locale.value)}</h2>
            <p class="order-confirm__text">{t("order.text", locale.value)}</p>
            <a href="/" class="btn btn--primary">{t("order.continue", locale.value)}</a>
          </div>
        </div>
      )}
    </>
  );
});
