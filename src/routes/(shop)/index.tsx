import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

// The catalog IS the home route. The ProductCatalog shell is rendered by the
// group layout; this entry just provides the route + document head. The catalog
// grid shows because the layout's <Slot/> (this component) is empty.
export default component$(() => {
  return <></>;
});

export const head: DocumentHead = {
  title: "Black & McDonald Apparel",
  meta: [
    { name: "description", content: "Black & McDonald Employee Apparel. Order branded jackets, vests, work wear, and more." },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "Black & McDonald Apparel" },
    { property: "og:description", content: "Internal apparel ordering for Black & McDonald staff." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://apparel.blackandmcdonald.com/" },
    { property: "og:image", content: "https://apparel.blackandmcdonald.com/BlackMcDonald_Logo.webp" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Black & McDonald Apparel" },
    { name: "twitter:description", content: "Internal apparel ordering for Black & McDonald staff." },
    { name: "twitter:image", content: "https://apparel.blackandmcdonald.com/BlackMcDonald_Logo.webp" },
  ],
};
