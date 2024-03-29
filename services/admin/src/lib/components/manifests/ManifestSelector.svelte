<!--
@component
### Overview
This componenet allows the user to search the backend for any access object that has a slug that contains the search term. It lists matching objects in a table.

### Properties
|    |    |    |
| -- | -- | -- |
| label : string       | optional | The label for the search input. |
| placeholder : string | optional | The placeholder for the search input. |
| type : string | undefined | optional | he type of object you would like to search for. |

### Usage
```  
<TypeAhead label="Label:" placeholder="placeholder" on:selected={(event) -> { console.log(event.detail) }} />
```
*Note: the noid of the selected item is returned from `on:selected`*
-->
<script lang="ts">
	import type { Session } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { getStores } from '$app/stores';
	import PrefixSlugSearchBox from '../access-objects/PrefixSlugSearchBox.svelte';
	import type { Noid, Slug } from '@crkn-rcdr/access-data';
	import Loading from '../shared/Loading.svelte';

	/**
	 * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
	 */
	const dispatch = createEventDispatcher();

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/**
	 * @type {string} An error message to be displayed.
	 */
	let error = '';

	/**
	 * @type {NodeJS.Timeout | null} Used to debounce the searching of slugs.
	 */
	let timer: NodeJS.Timeout | null = null;

	let searchedSlugs: Slug[] = [];
	let foundSlugs: Slug[] = [];
	let manifestSlugObjMap: any = {};
	let selectedManifestNoids: Noid[] = [];
	let loading: boolean = false;
	let allSelected = true;
	let searchMade = false;
	let numCanvases = 0;

	/**
	 * Dispatches the @event on:keypress with the query set as the event.detail. It then sends a request to the backend to get the objects whos slug contains the query, if the query is not empty. If the request was successful, the results are stored in @var lookupList. Otherwise @var error is set and displayed to the user.
	 * @returns void
	 */
	async function handleSearchPressed() {
		if (!searchedSlugs.length) return;
		if (timer) clearTimeout(timer);
		loading = true;
		manifestSlugObjMap = {};
		selectedManifestNoids = [];
		numCanvases = 0;
		timer = setTimeout(async () => {
			try {
				const response = await $session.lapin.mutation(`manifest.search`, {
					slugs: searchedSlugs,
					fields: ['id', 'label', 'canvases']
				});
				for (const result of response) {
					if (result.length === 2) {
						const slug = result[0];
						const info = result[1];
						if (info.found && info.result) {
							manifestSlugObjMap[slug] = info.result;
							selectedManifestNoids.push(manifestSlugObjMap[slug].id);
							if (manifestSlugObjMap[slug].canvases)
								numCanvases += manifestSlugObjMap[slug].canvases.length;
						}
					}
				}
				loading = false;
				searchMade = true;
				manifestSlugObjMap = manifestSlugObjMap;
				selectedManifestNoids = selectedManifestNoids;
			} catch (e) {
				console.log(e);
			}
		}, 1000);
	}

	async function handleSlugListChange(event) {
		searchedSlugs = event.detail;
		await handleSearchPressed();
	}

	function handleItemSelected(manifest: any) {
		console.log(manifest);
		if (selectedManifestNoids.includes(manifest.id)) {
			selectedManifestNoids = selectedManifestNoids.filter((item) => item !== manifest.id);
			if (manifest.canvases) numCanvases -= manifest.canvases.length;
		} else {
			selectedManifestNoids.push(manifest.id);
			if (manifest.canvases) numCanvases += manifest.canvases.length;
		}
		selectedManifestNoids = selectedManifestNoids;
	}

	function toggleAllSelected() {
		allSelected = !allSelected;
		if (allSelected) {
			numCanvases = 0;
			let allList = [];
			for (let slug of foundSlugs) {
				allList.push(manifestSlugObjMap[slug].id);
				if (manifestSlugObjMap[slug].canvases)
					numCanvases += manifestSlugObjMap[slug].canvases.length;
			}
			selectedManifestNoids = allList;
		} else {
			selectedManifestNoids = [];
			numCanvases = 0;
		}
	}

	$: {
		foundSlugs = manifestSlugObjMap ? Object.keys(manifestSlugObjMap) : [];
	}

	$: dispatch('change', selectedManifestNoids);
</script>

<div class="auto-align auto-align__full">
	<div>
		<PrefixSlugSearchBox rows={12} on:slugs={handleSlugListChange} />
	</div>

	<div class="table-wrap">
		<div class="canvas-count">
			{#if loading}
				<span class="loader">
					<Loading size="sm" backgroundType="gradient" />
				</span>
			{:else}
				{numCanvases} Canvases Selected
			{/if}
		</div>

		<table class="table">
			<thead>
				<tr>
					<th>
						<input type="checkbox" checked on:click={toggleAllSelected} />
					</th>
					<th> Slug </th>
					<th> Label </th>
					<th class="canvases-row"> # Canvases </th>
				</tr>
			</thead>
			<tbody>
				{#each searchedSlugs as slug}
					{#if loading}
						<tr>
							<td>
								<input type="checkbox" disabled />
							</td>
							<td colspan="3">
								{slug}
							</td>
						</tr>
					{:else if !(slug in manifestSlugObjMap)}
						<tr>
							<td>
								<input type="checkbox" disabled />
							</td>
							<td colspan="3">
								{slug}
							</td>
						</tr>
						<tr class="not-success">
							<td colspan="4">Not found</td>
						</tr>
					{:else if !manifestSlugObjMap[slug]['canvases']?.length}
						<tr>
							<td>
								<input type="checkbox" disabled />
							</td>
							<td colspan="3">
								{slug}
							</td>
						</tr>
						<tr class="not-success">
							<td colspan="4">No canvases to OCR</td>
						</tr>
					{:else}
						<tr class="clickable">
							<td>
								<input
									type="checkbox"
									checked={selectedManifestNoids.includes(manifestSlugObjMap[slug].id)}
									on:click={() => handleItemSelected(manifestSlugObjMap[slug])}
								/>
							</td>
							<td>
								{slug}
							</td>
							<td>
								{manifestSlugObjMap[slug]['label']?.['none']}
							</td>
							<td>
								{manifestSlugObjMap[slug]['canvases']?.length}
							</td>
						</tr>
					{/if}
				{/each}

				{#if !searchMade}
					<tr>
						<td colspan="4"> Search results will appear here. </td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
<br />

{#if error}
	<p class="danger">{error}</p>
{/if}

<style>
	.table-wrap {
		position: relative;
		max-height: 43vh;
		overflow-y: auto;
		overflow-x: hidden;
		margin-left: 1rem;
		width: 100%;
	}
	table {
		position: relative;
	}
	.canvas-count {
		position: sticky;
		top: 0;
		background: white;
		z-index: 2;
		height: 2rem;
		font-size: 1.22rem !important;
	}
	th {
		position: sticky;
		top: 0;
		background: var(--backdrop-bg);
		z-index: 1;
		top: 2rem;
	}
	.not-success {
		background-color: var(--danger-light);
		color: var(--danger);
	}
	.loader {
		text-align: right;
	}
	.canvases-row {
		min-width: 9rem;
	}
</style>
