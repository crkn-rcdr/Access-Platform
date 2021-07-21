import preprocess from "svelte-preprocess";
import nodeAdapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: nodeAdapter({
      env: {
        port: "ADMIN_PORT",
      },
      out: "dist",
    }),

    prerender: {
      enabled: false,
    },

    // hydrate the <div id="svelte"> element in src/app.html
    target: "#svelte",

    vite: {
      server: {
        hmr: {
          port: 14747,
        },
      },
    },
  },
};

export default config;
