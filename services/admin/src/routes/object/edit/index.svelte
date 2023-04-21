<script lang="ts">
	/**
	 * @file
	 * @description This is the main page for the app
	 */
	import TypeAhead from '$lib/components/access-objects/TypeAhead.svelte';
	import DropdownMenu from '$lib/components/shared/DropdownMenu.svelte';
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
		<div class="dropdown create-dd">
			<button
				class="btn btn-secondary dropdown-toggle create"
				type="button"
				id="dropdownMenuButton1"
				data-bs-toggle="dropdown"
				aria-expanded="false"
			>
				Create New
			</button>
			<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
				<li><a class="dropdown-item" href="/object/new/collection">Collection</a></li>
				<li><a class="dropdown-item" href="/object/new/manifest">Manifest</a></li>
			</ul>
		</div>

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
	.create-dd {
		display: inline-block;
		margin-right: 1rem;
	}
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
