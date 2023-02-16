<script lang="ts">
	/**
	 * @file
	 * @description This is the main page for the app
	 */
	import TypeAhead from '$lib/components/access-objects/TypeAhead.svelte';
	import PrefetchLoader from '$lib/components/shared/PrefetchLoader.svelte';
	import { Noid } from '@crkn-rcdr/access-data';

	/**
	 * @type {string} The link to the object selected form the search bar.
	 */
	let objectHref: string;

	/**
	 * Routes to the object the user clicks from the TypeAhead component
	 * @param event
	 * @returns void
	 */
	async function slugSelected(event: CustomEvent<string>) {
		const noid = event.detail;
		try {
			if (Noid.parse(noid)) objectHref = `/object/edit/${noid}`;
		} catch (e) {
			console.log(e);
		}
	}
</script>

<PrefetchLoader bind:href={objectHref}>
	<div class="updates">
		<a href="/object/edit/data-transfer"> Bulk Data Transfer </a>
		<a href="/ocr/ocr-pdf"> Bulk Create OCR PDF </a>
	</div>
	<br />
	<div class="search">
		<TypeAhead
			placeholder="Search for existing collections and manifests to edit..."
			on:selected={slugSelected}
		/>
	</div>
</PrefetchLoader>

<style>
	.search {
		max-width: 50rem;
		margin: auto;
	}
	.updates {
		max-width: 50rem;
		text-align: left;
		margin: auto;
		color: var(--primary);
	}

	.updates a {
		margin-right: 1rem;
	}
</style>
