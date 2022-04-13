import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
			envPrefix: 'ADMIN_',
			out: 'dist'
		}),

		/* Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		}*/

		prerender: {
			enabled: false
		},
		vite: {
			server: {
				hmr: {
					port: 14747
				}
			}
		}
	}
};

export default config;
/*
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter({
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
*/
