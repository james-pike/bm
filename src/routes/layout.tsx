import { component$, Slot, useSignal, useVisibleTask$, } from "@builder.io/qwik";
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

const AUTH_COOKIE = "ce_auth";

function isAuthenticated(cookie: Cookie): boolean {
  return cookie.get(AUTH_COOKIE)?.value === "authenticated";
}

export const useAuthCheck = routeLoader$(({ cookie }) => {
  return { loggedIn: isAuthenticated(cookie) };
});

export const useLogin = routeAction$(
  ({ username, password }, { cookie, fail }) => {
    if (username === "admin" && password === "Carmichael") {
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

export default component$(() => {
  const loc = useLocation();
  const auth = useAuthCheck();
  const loginAction = useLogin();
  const logoutAction = useLogout();
  const isApparel = loc.url.pathname.startsWith("/apparel");
  const showLogin = useSignal(false);

  // Auto-open login modal when redirected with ?login=1
  useVisibleTask$(() => {
    if (loc.url.searchParams.get("login") === "1" && !auth.value.loggedIn) {
      showLogin.value = true;
    }
  });

  // Close modal on successful login
  useVisibleTask$(({ track }) => {
    track(() => loginAction.value);
    if (loginAction.value && !loginAction.value.failed) {
      showLogin.value = false;
    }
  });

  return (
    <>
      <header class="site-header">
        <div class="accent-bar" />
        <div class="site-header__inner">
          <Link href="/" class="site-header__logo">
            <img
              src="/logo-carmichael.jpg"
              alt="Carmichael Engineering"
              class="site-header__logo-img"
            />
          </Link>
          <nav class="site-header__nav">
            <Link href="/" class={loc.url.pathname === "/" ? "active" : ""}>
              Home
            </Link>
            <Link href="/apparel/#products" class={isApparel ? "active" : ""}>
              Apparel
            </Link>
            {auth.value.loggedIn ? (
              <Form action={logoutAction}>
                <button type="submit" class="site-header__login site-header__login--logout">
                  Log Out
                </button>
              </Form>
            ) : (
              <button
                class="site-header__login"
                onClick$={() => (showLogin.value = true)}
              >
                Log In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin.value && (
        <div class="login-overlay" onClick$={() => (showLogin.value = false)}>
          <div class="login-modal" onClick$={(e) => e.stopPropagation()}>
            <button
              class="login-modal__close"
              onClick$={() => (showLogin.value = false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div class="login-modal__header">
              <img
                src="/logo-carmichael.jpg"
                alt="Carmichael Engineering"
                class="login-modal__logo"
              />
              <h2 class="login-modal__title">Employee Login</h2>
              <p class="login-modal__subtitle">
                Sign in to access the apparel store
              </p>
            </div>
            <Form action={loginAction} class="login-modal__form">
              {loginAction.value?.failed && (
                <div class="login-modal__error">
                  {loginAction.value.fieldErrors?.username ||
                    loginAction.value.fieldErrors?.password ||
                    loginAction.value.message}
                </div>
              )}
              <div class="login-modal__field">
                <label for="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Enter username"
                />
              </div>
              <div class="login-modal__field">
                <label for="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter password"
                />
              </div>
              <button type="submit" class="btn btn--green login-modal__submit">
                {loginAction.isRunning ? "Signing in..." : "Sign In"}
              </button>
            </Form>
          </div>
        </div>
      )}

      <main>
        <Slot />
      </main>

      <footer class="site-footer">
        <div class="site-footer__inner">
          <div class="site-footer__brand">
            Carmichael <span>Engineering</span> &mdash; Employee Apparel Store
          </div>
          <div class="site-footer__text">
            Internal use only. Contact HR for order assistance.
          </div>
        </div>
      </footer>
    </>
  );
});
