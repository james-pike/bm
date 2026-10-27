import { routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

// The catalog moved to "/" — keep old /apparel/ links working.
export const useRedirect = routeLoader$(({ redirect }) => {
  throw redirect(301, "/");
});

export default component$(() => <></>);
