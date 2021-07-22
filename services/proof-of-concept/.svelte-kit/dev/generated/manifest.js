const c = [
	() => import("../../../src/routes/__layout.svelte"),
	() => import("../../../src/routes/__error.svelte"),
	() => import("../../../src/routes/index.svelte"),
	() => import("../../../src/routes/dragdrop.svelte"),
	() => import("../../../src/routes/takedown/index.svelte"),
	() => import("../../../src/routes/object/__layout.svelte"),
	() => import("../../../src/routes/object/index.svelte"),
	() => import("../../../src/routes/object/[prefix]/[noid].svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	// src/routes/dragdrop.svelte
	[/^\/dragdrop\/?$/, [c[0], c[3]], [c[1]]],

	// src/routes/takedown/index.svelte
	[/^\/takedown\/?$/, [c[0], c[4]], [c[1]]],

	// src/routes/object/index.svelte
	[/^\/object\/?$/, [c[0], c[5], c[6]], [c[1]]],

	// src/routes/object/[prefix]/[noid].svelte
	[/^\/object\/([^/]+?)\/([^/]+?)\/?$/, [c[0], c[5], c[7]], [c[1]], (m) => ({ prefix: d(m[1]), noid: d(m[2])})],

	// src/routes/slug/resolve/many.json.ts
	[/^\/slug\/resolve\/many\.json$/],

	// src/routes/slug/resolve/[slug].json.ts
	[/^\/slug\/resolve\/([^/]+?)\.json$/],

	// src/routes/slug/search/[query].json.ts
	[/^\/slug\/search\/([^/]+?)\.json$/],

	// src/routes/api/[name].ts
	[/^\/api\/([^/]+?)\/?$/]
];

export const fallback = [c[0](), c[1]()];