import { component$, Slot, useSignal, useVisibleTask$, $, useContextProvider, useStore, useComputed$ } from "@builder.io/qwik";
import { Modal, Collapsible } from '@qwik-ui/headless';
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
import { createClient } from "@libsql/client";
import { LocaleContext, t } from "../i18n";
import type { Locale, TranslationKey } from "../i18n";

const AUTH_COOKIE = "ce_auth"; // v2: orders persist to db
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

export const useCartCountLoader = routeLoader$(({ cookie }) => {
  return parseInt(cookie.get("ce_cart_count")?.value || "0", 10);
});

export const useLogin = routeAction$(
  ({ username, password }, { cookie, fail }) => {
    if (username === "admin" && password === "CM26") {
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
  const tursoUrl = env.get("TURSO_URL") || env.get("VITE_TURSO_URL") || import.meta.env.VITE_TURSO_URL;
  const tursoToken = env.get("TURSO_AUTH_TOKEN") || env.get("VITE_TURSO_AUTH_TOKEN") || import.meta.env.VITE_TURSO_AUTH_TOKEN;
  const apiKey = env.get("RESEND_API_KEY") || env.get("VITE_RESEND_API_KEY") || import.meta.env.VITE_RESEND_API_KEY;

  const { employee, items, date } = data as {
    employee: { number: string; name: string; department: string };
    items: { name: string; sku?: string; color: string; size: string; quantity: number; price: number }[];
    date: string;
  };

  const colorMap: Record<string, string> = {
    "#00703c": "Green", "#1a1a18": "Black", "#ffffff": "White",
    "#2c3e50": "Navy", "#94a3b8": "Silver", "#4a4a4a": "Charcoal",
    "#8d5f18": "Bronze",
  };
  const cName = (hex: string) => colorMap[hex] || hex;

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0);

  // Insert order into Turso database
  if (!tursoUrl || !tursoToken) {
    return fail(500, { message: "Order database not configured" });
  }
  try {
    const db = createClient({ url: tursoUrl, authToken: tursoToken });
    await db.execute({
      sql: `INSERT INTO orders (vendor, emp_number, emp_name, emp_dept, items, total, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))`,
      args: [
        "carmichael",
        employee.number,
        employee.name,
        employee.department,
        JSON.stringify(items),
        total,
      ],
    });
  } catch (err) {
    console.error("Failed to save order to database:", err);
    return fail(500, { message: "Failed to save order. Please try again." });
  }

  // Send order confirmation email
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured — order saved but email not sent");
    return { success: true };
  }

  const itemRows = items.map((i) =>
    `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${i.name}${i.sku ? ` <span style="color:#999;font-size:12px">(${i.sku})</span>` : ""}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${cName(i.color)} / ${i.size}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">$${(Number(i.price) || 0) * i.quantity}</td>
    </tr>`
  ).join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a3a28;padding:20px 24px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">Carmichael Apparel — Apparel Order</h1>
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
      from: "Carmichael Apparel <onboarding@resend.dev>", // TODO: change to orders@carmichaelengineering.com after domain verification
      to: ["cs@safetyhouse.ca"],
      subject: `Apparel Order — ${employee.name} (${employee.number}) — ${date}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send order email:", err);
    // Order was already saved — don't fail the whole action
  }

  return { success: true };
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
  const menuOpen = useSignal(false);
  const savedLocale = useLocaleLoader();
  const locale = useSignal<Locale>(savedLocale.value);

  useContextProvider(LocaleContext, locale);

  // Cart state
  const initialCartCount = useCartCountLoader();
  const cart = useStore<{ items: CartItem[] }>({ items: [] });
  const ssrCartCount = useSignal(initialCartCount.value);
  const cartOpen = useSignal(false);
  const orderSubmitted = useSignal(false);
  const checkoutOpen = useSignal(false);
  const formError = useSignal("");
  const formTouched = useSignal(false);
  const empNumber = useSignal("");
  const empName = useSignal("");
  const empEmail = useSignal("");
  const empDept = useSignal("");

  const cartCount = useComputed$(() => {
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    return count > 0 ? count : ssrCartCount.value;
  });
  const headerScrolled = useSignal(false);

  const toggleLocale = $(() => {
    locale.value = locale.value === "en" ? "fr" : "en";
    document.cookie = `${LOCALE_COOKIE}=${locale.value};path=/;max-age=31536000`;
  });

  // Load cart from localStorage — eager strategy to ensure it runs immediately
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
    const loadCart = () => {
      console.log("loadCart called");
      try {
        const saved = localStorage.getItem("ce_cart");
        console.log("ce_cart from localStorage:", saved?.length, "chars");
        if (saved) {
          cart.items = JSON.parse(saved) as CartItem[];
          console.log("cart.items set to", cart.items.length, "items");
        } else {
          cart.items = [];
        }
        const count = cart.items.reduce((sum, i: any) => sum + i.quantity, 0);
        document.cookie = `ce_cart_count=${count};path=/;max-age=31536000`;
        ssrCartCount.value = 0; // clear SSR fallback once real data loaded
      } catch { cart.items = []; }
    };
    loadCart();
    window.addEventListener("cart-updated", loadCart);
    cleanup(() => window.removeEventListener("cart-updated", loadCart));
  }, { strategy: 'document-ready' });

  const saveCart = $(() => {
    try {
      localStorage.setItem("ce_cart", JSON.stringify(cart.items));
      const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      document.cookie = `ce_cart_count=${count};path=/;max-age=31536000`;
    } catch { /* ignore */ }
  });

  const removeFromCart = $(async (index: number) => {
    cart.items = cart.items.filter((_, i) => i !== index);
    await saveCart();
    window.dispatchEvent(new CustomEvent("cart-updated"));
  });

  const updateQty = $(async (index: number, delta: number) => {
    const newQty = cart.items[index].quantity + delta;
    if (newQty < 1) {
      cart.items = cart.items.filter((_, i) => i !== index);
    } else {
      cart.items = cart.items.map((item, i) => i === index ? { ...item, quantity: newQty } : item);
    }
    await saveCart();
    window.dispatchEvent(new CustomEvent("cart-updated"));
  });

  const submitOrder = $(async () => {
    formTouched.value = true;
    if (!empNumber.value || !empName.value || !empEmail.value || !empDept.value) {
      formError.value = t("cart.error.required", locale.value);
      checkoutOpen.value = true;
      return;
    }
    formError.value = "";

    const orderData = {
      employee: { number: empNumber.value, name: empName.value, email: empEmail.value, department: empDept.value },
      items: cart.items.map((i) => ({
        name: i.name, sku: i.sku, color: i.color, size: i.size,
        quantity: i.quantity, price: i.price,
      })),
      date: new Date().toLocaleDateString("en-CA"),
    };

    // Send order via server action
    const result = await orderAction.submit(orderData);

    if (result.value?.failed) {
      formError.value = (result.value as any).message || "Failed to place order. Please try again.";
      return;
    }

    cart.items = [];
    await saveCart();
    window.dispatchEvent(new CustomEvent("cart-updated"));
    orderSubmitted.value = true;
    cartOpen.value = false;
    empNumber.value = "";
    empName.value = "";
    empEmail.value = "";
    formTouched.value = false;
    empDept.value = "";
  });


  // Listen for open-cart events from child pages
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const handler = () => {
      cartOpen.value = true;
      setTimeout(() => {
        checkoutOpen.value = true;
      }, 100);
    };
    window.addEventListener("open-cart", handler);
    cleanup(() => window.removeEventListener("open-cart", handler));
  }, { strategy: 'document-ready' });

  // Sticky header on scroll (mobile landing page)
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const onScroll = () => { headerScrolled.value = window.scrollY > 60; };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanup(() => window.removeEventListener("scroll", onScroll));
  }, { strategy: 'document-ready' });

  // Close cart on navigation
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => loc.url.pathname);
    cartOpen.value = false;
  }, { strategy: 'document-ready' });

  // Lock scroll when cart is open
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => cartOpen.value);
    if (cartOpen.value) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = Math.abs(parseInt(document.body.style.top || "0", 10));
      document.body.style.cssText = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    }
  }, { strategy: 'document-ready' });

  // Auto-open login modal and lock scroll for unauthenticated users
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!auth.value.loggedIn) {
      showLogin.value = true;
      document.documentElement.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.inset = "0";
      document.body.style.overflow = "hidden";
    }
  }, { strategy: 'document-ready' });

  // Close modal and unlock scroll on successful login
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => loginAction.value);
    if (loginAction.value && !loginAction.value.failed) {
      overlayFading.value = true;
      document.documentElement.style.overflow = "";
      document.body.style.cssText = "";
      window.scrollTo({ top: 0, behavior: "instant" });
      setTimeout(() => {
        showLogin.value = false;
        overlayFading.value = false;
      }, 800);
    }
  }, { strategy: 'document-ready' });

  return (
    <>
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
                src="/carmichael-logo.png"
                alt="Carmichael Apparel"
                class="login-modal__logo"
              />
              <h2 class="login-modal__title">{t("login.title", locale.value)}</h2>
              <p class="login-modal__subtitle">
                {t("login.subtitle", locale.value)}
              </p>
            </div>
            <Form action={loginAction} class="login-modal__form">
              {loginAction.value?.failed && (
                <div class="login-modal__error">{loginAction.value.message}</div>
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

      {(auth.value.loggedIn || (loginAction.value && !loginAction.value.failed)) && <>
      <div class="desktop-soon">Desktop coming soon</div>
      <header class={`site-header ${cartOpen.value ? "site-header--cart-open" : ""} ${loc.url.pathname === "/" && !cartOpen.value ? `site-header--transparent ${headerScrolled.value ? "site-header--scrolled" : ""}` : ""}`}>
        <div class="site-header__inner">
          <Link href="/" class="site-header__logo">
            <img
              src="/carmichael-logo.png"
              alt="Carmichael Apparel"
              class="site-header__logo-img"
              width="200"
              height="200"
              loading="eager"
              decoding="sync"
            />
            <div class="site-header__logo-brand">
              <img
                src="/logo-carmichael.jpg"
                alt="Carmichael Apparel"
                class="site-header__logo-text"
                width="408"
                height="61"
                loading="eager"
                decoding="sync"
              />
              <span class="site-header__logo-apparel">{t("logo.apparel", locale.value)}</span>
            </div>
          </Link>
          <nav class="site-header__categories">
            <Link href="/" class={loc.url.pathname === "/" ? "active" : ""}>{t("nav.home", locale.value)}</Link>
            <Link href="/apparel/" class={loc.url.pathname.startsWith("/apparel") ? "active" : ""}>{t("nav.apparel", locale.value)}</Link>
          </nav>
          <nav class="site-header__nav">
            <button class={`locale-btn ${cartOpen.value ? "locale-btn--cart-open" : ""}`} onClick$={toggleLocale} aria-label="Toggle language">
              <svg class="locale-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              <span class="locale-btn__full">{locale.value === "en" ? "Français" : "English"}</span>
              <span class="locale-btn__short">{locale.value === "en" ? "FR" : "EN"}</span>
            </button>
            <button class={`cart-btn ${cart.items.length > 0 ? "cart-btn--active" : ""}`} onClick$={() => { cartOpen.value = !cartOpen.value; }}>
              <span class="cart-btn__label">{t("cart.mycart", locale.value)}</span>
              {cartOpen.value ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                  <span class={`cart-btn__dot ${cart.items.length > 0 ? "cart-btn__dot--visible" : ""}`} />
                </>
              )}
            </button>
            <button class="hamburger-btn" onClick$={() => (menuOpen.value = !menuOpen.value)} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {menuOpen.value && (
        <div class="nav-drawer-overlay" onClick$={() => (menuOpen.value = false)}>
          <nav class="nav-drawer" onClick$={(e) => e.stopPropagation()}>
            <div class="nav-drawer__header">
              <div class="nav-drawer__brand">
                <img src="/carmichael-logo.png" alt="Carmichael" class="nav-drawer__logo" width="48" height="48" />
                <div class="nav-drawer__brand-text">
                  <img src="/logo-carmichael.jpg" alt="Carmichael" class="nav-drawer__logo-text" />
                  <span class="nav-drawer__apparel">{t("logo.apparel", locale.value)}</span>
                </div>
              </div>
              <button class="nav-drawer__close" onClick$={() => (menuOpen.value = false)} aria-label="Close">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="nav-drawer__links">
              <a href="/" class={`nav-drawer__link ${loc.url.pathname === "/" ? "active" : ""}`} onClick$={() => (menuOpen.value = false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                {t("nav.home", locale.value)}
              </a>
              <a href="/apparel/" class={`nav-drawer__link ${loc.url.pathname.startsWith("/apparel") ? "active" : ""}`} onClick$={() => (menuOpen.value = false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                {t("teaser.all.title", locale.value)}
              </a>
              <a href="/apparel/?category=Work Wear" class="nav-drawer__link" onClick$={() => (menuOpen.value = false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M4 6h16v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"/><path d="M4 6l-2 4v2h4V8"/><path d="M20 6l2 4v2h-4V8"/></svg>
                {t("cat.Work Wear", locale.value)}
              </a>
              <a href="/apparel/?category=Jackets" class="nav-drawer__link" onClick$={() => (menuOpen.value = false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2l5 6v12a2 2 0 01-2 2h-3V12h-6v10H6a2 2 0 01-2-2V8l5-6"/><path d="M9 2a3 3 0 006 0"/><line x1="12" y1="12" x2="12" y2="22"/></svg>
                {t("cat.Jackets", locale.value)}
              </a>
              <a href="/apparel/?category=Polos" class="nav-drawer__link" onClick$={() => (menuOpen.value = false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2 12 5.5 8 2 3.62 3.46a2 2 0 00-1.34 1.93v15.12a2 2 0 001.34 1.93L8 24l4-3.5L16 24l4.38-1.46a2 2 0 001.34-1.93V5.39a2 2 0 00-1.34-1.93z"/></svg>
                {t("cat.Polos", locale.value)}
              </a>
              <a href="/apparel/?category=Hats" class="nav-drawer__link" onClick$={() => (menuOpen.value = false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 00-7 7c0 3 2 5 3 6h8c1-1 3-3 3-6a7 7 0 00-7-7z"/><path d="M5 15h14"/><path d="M6 18h12"/></svg>
                {t("cat.Hats", locale.value)}
              </a>
            </div>
            <div class="nav-drawer__footer">
              <button class="nav-drawer__locale" onClick$={() => { toggleLocale(); }}>
                {locale.value === "en" ? "Français" : "English"}
              </button>
            </div>
          </nav>
        </div>
      )}

      <main>
        <Slot />
      </main>

      {/* Cart Drawer */}
      {cartOpen.value && (
        <div class="modal-overlay" onClick$={() => (cartOpen.value = false)}>
          <div class="drawer cart-drawer" onClick$={(e) => e.stopPropagation()}>
            <div class="cart-drawer__site-header">
              <Link href="/" class="site-header__logo">
                <img src="/carmichael-logo.png" alt="Carmichael Apparel" class="site-header__logo-img" width="200" height="200" loading="eager" decoding="sync" />
                <img src="/logo-carmichael.jpg" alt="Carmichael Apparel" class="site-header__logo-text" width="408" height="61" loading="eager" decoding="sync" />
                <span class="site-header__logo-apparel">{t("logo.apparel", locale.value)}</span>
              </Link>
              <nav class="site-header__nav">
                <button class="cart-btn" onClick$={() => (cartOpen.value = false)}>
                  <span class="cart-btn__label">{t("cart.mycart", locale.value)}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                </button>
              </nav>
            </div>
            <div class="cart-drawer__header">
              <h2 class="cart-drawer__title">{t("cart.title", locale.value)} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg></h2>
              <button class="modal__close cart-drawer__close-desktop" onClick$={() => (cartOpen.value = false)}>x</button>
            </div>
            {cart.items.length === 0 ? (
              <div class="cart-drawer__empty">
                <p>{t("cart.empty", locale.value)}</p>
                <a href="/apparel/" class="cart-drawer__back-link" onClick$={() => (cartOpen.value = false)}>{t("cart.backtoapparel", locale.value)}</a>
              </div>
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
                        <tr key={`${item.name}-${item.size}-${item.color}-${item.quantity}`}>
                          <td class="cart-table__product">
                            <div class="cart-table__product-row">
                            <img src={item.img} alt={item.name} width="40" height="30" class="cart-table__img" />
                            <div>
                            <Link href={item.sku ? `/apparel/${item.sku}/` : "/apparel/"} class="cart-table__name-link">{item.name}</Link>
                            <div class="cart-table__meta">
                              {colorName(item.color, locale.value)} / {item.size}                              <button class="cart-table__remove" aria-label={`Remove ${item.name}`} onClick$={() => removeFromCart(i)}>&times;</button>
                            </div>
                            </div>
                            </div>
                          </td>
                          <td class="cart-table__qty">
                            <div class="cart-table__qty-controls">
                              <button class="cart-table__qty-btn" aria-label={`Decrease quantity of ${item.name}`} onClick$={() => updateQty(i, -1)}>-</button>
                              <span>{item.quantity}</span>
                              <button class="cart-table__qty-btn" aria-label={`Increase quantity of ${item.name}`} onClick$={() => updateQty(i, 1)}>+</button>
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
                <Collapsible.Root class="cart-drawer__checkout" bind:open={checkoutOpen}>
                  <Collapsible.Trigger class="cart-drawer__checkout-title">
                    {t("cart.orderdetails", locale.value)}
                    {(!empNumber.value || !empName.value || !empEmail.value || !empDept.value) && (
                      <span class={`cart-drawer__required-label ${formError.value ? "cart-drawer__required-label--error" : ""}`}>
                        {t("cart.requiredfields", locale.value)}
                      </span>
                    )}
                  </Collapsible.Trigger>
                  <Collapsible.Content>
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
                    <div class={`checkout-modal__field ${formTouched.value && !empEmail.value ? "checkout-modal__field--error" : ""}`}>
                      <label>{t("cart.email", locale.value)}</label>
                      <input
                        type="email"
                        value={empEmail.value}
                        onInput$={(_, el) => { empEmail.value = el.value; formError.value = ""; }}
                      />
                    </div>
                    <div class={`checkout-modal__field ${formTouched.value && !empDept.value ? "checkout-modal__field--error" : ""}`}>
                      <label>{t("cart.department", locale.value)}</label>
                      <input
                        type="text"
                        value={empDept.value}
                        onInput$={(_, el) => (empDept.value = el.value)}
                      />
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
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
      <Modal.Root bind:show={orderSubmitted} closeOnBackdropClick={true}>
        <Modal.Panel class="modal-overlay">
          <div class="modal order-confirm">
            <h2 class="order-confirm__title">{t("order.title", locale.value)}</h2>
            <p class="order-confirm__text">{t("order.text", locale.value)}</p>
            <a href="/" class="btn btn--primary">{t("order.continue", locale.value)}</a>
          </div>
        </Modal.Panel>
      </Modal.Root>
      </>}
    </>
  );
});
