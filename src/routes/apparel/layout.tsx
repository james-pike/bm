import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useApparelAuthGuard = routeLoader$(({ cookie, redirect }) => {
  if (cookie.get("ce_auth")?.value !== "authenticated") {
    throw redirect(302, "/?login=1");
  }
});

export default component$(() => {
  return (
    <div class="apparel-page dot-pattern dot-pattern--light">
      <Slot />
    </div>
  );
});
