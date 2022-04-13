<script context="module" lang="ts">
	/**
	 * @module
	 * @description loads in the object from the backend using the params in the route of the page
	 */
	import type { Load } from '@sveltejs/kit';
	import type { RootLoadOutput } from '$lib/types';
	export const load: Load<RootLoadOutput> = async ({ params, stuff }) => {
		try {
			if (params['type']) {
				if (params['type'] === 'collection')
					return {
						props: {
							serverObject: {
								slug: '',
								label: {
									none: undefined
								},
								type: 'collection',
								behavior: 'unordered',
								members: []
							}
						}
					};
				else if (params['type'] === 'manifest')
					return {
						props: {
							serverObject: {
								slug: '',
								label: {
									none: undefined
								},
								type: 'manifest',
								from: 'canvases',
								canvases: []
							}
						}
					};
				else return { props: {} };
			} else return { props: {} };
		} catch (e) {
			return e;
		}
	};
</script>

<script lang="ts">
	/**
	 * @file
	 * @description This page shows the editor for creating a new serverObject.
	 */
	import type { AccessObject } from '@crkn-rcdr/access-data';
	import Editor from '$lib/components/access-objects/Editor.svelte';

	/**
	 * @type {AccessObject} Object being created.
	 */
	export let serverObject: AccessObject;
</script>

{#if serverObject}
	<Editor bind:serverObject />
{:else}
	Loading...
{/if}

<style>
	.obect-type-select {
		width: 100%;
	}
	.obect-type-select > * {
		margin-bottom: 1rem;
	}
</style>
