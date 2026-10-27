import { routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

// Product pages moved from /apparel/<sku>/ to /<sku>/ — keep old links working.
export const useRedirect = routeLoader$(({ params, redirect }) => {
  throw redirect(301, `/${encodeURIComponent(params.sku)}/`);
});

export default component$(() => <></>);
