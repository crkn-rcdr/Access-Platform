import preprocess from "svelte-preprocess";
import nodeAdapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: nodeAdapter(),

    hostHeader: "x-forwarded-host",

    // hydrate the <div id="svelte"> element in src/app.html
    target: "#svelte",
  },
};
