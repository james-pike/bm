import { component$, Slot, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { ProductCatalog } from "../../components/product-catalog/product-catalog";

const heroImg = [
  { src: "/carmichael-services/boiler-technicians.jpeg", alt: "Work Wear collection" },
  { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=360&fit=crop", alt: "On the job" },
] as [{ src: string; alt: string }, { src: string; alt: string }];

export const useApparelAuthGuard = routeLoader$(({ cookie, redirect }) => {
  if (cookie.get("ce_auth")?.value !== "authenticated") {
    throw redirect(302, "/?login=1");
  }
});

export default component$(() => {
  const loc = useLocation();
  const isCatalog = useComputed$(() => /^\/apparel\/?$/.test(loc.url.pathname));

  return (
    <div class="apparel-page dot-pattern">
      {isCatalog.value ? (
        <>
          <div class="collection-hero">
            <div class="collection-hero__viewport">
              <div class="collection-hero__slide active">
                <div class="collection-hero__panel">
                  <img src={heroImg[0].src} alt={heroImg[0].alt} width="640" height="360" loading="eager" decoding="sync" />
                </div>
                <div class="collection-hero__panel">
                  <img src={heroImg[1].src} alt={heroImg[1].alt} width="640" height="360" loading="eager" decoding="sync" />
                </div>
              </div>
            </div>
          </div>
          <ProductCatalog />
        </>
      ) : (
        <Slot />
      )}
    </div>
  );
});
