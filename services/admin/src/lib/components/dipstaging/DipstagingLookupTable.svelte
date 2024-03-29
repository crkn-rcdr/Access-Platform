<!--
@component
### Overview
This component shows the results of a dipstaging find-package(s) request or a view. It allows the user to call smelter on eligible packages.

### Properties
|    |    |    |
| -- | -- | -- |
| results: ImportStatus[] | required | The packages to display |

### Usage
```
<DipstagingItemStatusTable bind:results />
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import type { ImportStatus, LegacyPackage } from '@crkn-rcdr/access-data';
	import SlugSearch from '$lib/components/access-objects/SlugSearch.svelte';
	import Loading from '$lib/components/shared/Loading.svelte';
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';
	import structuredClone from '@ungap/structured-clone';
	import DipstatingImportStatus from '$lib/components/dipstaging/DipstatingImportStatus.svelte';
	import LoadingButton from '$lib/components/shared/LoadingButton.svelte';

	/**
	 * @type {ImportStatus[]}
	 * The packages in the format of ImportStatus, to be displayed to the user/
	 */
	export let results: (ImportStatus | LegacyPackage)[];

	export let isSlugSearch = false;

	/**
	 * @type {boolean}
	 * An indicator of if the result's item models are being processed or not
	 */
	export let loading = false;

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/**
	 * @type {any} A map from ImportStatus.id => if the item is selected in the table
	 */
	let selectedMap: any = {};

	/**
	 * @type {any} A map from ImportStatus.id => if the request for adding the item to the smelte queue was sucessful or not
	 */
	let sucessfulSmeltRequestMap: any = {};

	/**
	 * @type {any} A map from ImportStatus.id => if the slug of the item's slug is available.
	 */
	let slugUnavailableMap: any = {};

	/**
	 * @type {any} A map from ImportStatus.id => if the slug of the item's slug is available.
	 */
	let noidMap: any = {};

	/**
	 * @type {any} A map from ImportStatus.id => if the slug of the item's slug is available.
	 */
	let slugMap: any = {};

	let error = '';

	let items: (ImportStatus | LegacyPackage)[] = [];

	let running: boolean = false;
	/**
	 * Keeps track if @param item is selected or not
	 * @param item
	 * @returns void
	 */
	function handleItemSelected(item: ImportStatus | LegacyPackage) {
		selectedMap[item['id']] = !selectedMap[item['id']];
		selectedMap = selectedMap;
	}

	/**
	 * Sets all of the item's selected boolean to the value of the table's control checkbox.
	 * @param event
	 * @returns void
	 */
	function toggleAllSelected(event) {
		for (const item of items) {
			if (!slugUnavailableMap[slugMap[item['id']]]) selectedMap[item['id']] = event.target.checked;
			else selectedMap[item['id']] = false;
		}
		selectedMap = selectedMap;
	}

	/**
	 * Sends a request to the back-end for each selected item in the table, to queue them up for smelter processing.
	 * @returns void
	 */
	async function handleRunSmelterPressed() {
		error = '';
		running = true;
		for (const item of items) {
			if (selectedMap[item['id']]) {
				try {
					const response = await $session.lapin.mutation(`dipstaging.requestSmelt`, {
						user: $session.user,
						id: item['id'],
						slug: slugMap[item['id']]
					});
					sucessfulSmeltRequestMap[item['id']] = true;
					sucessfulSmeltRequestMap = sucessfulSmeltRequestMap;
					selectedMap[item['id']] = false;
					selectedMap = selectedMap;
					item['status'] = 'processing';
					items = items;
				} catch (e) {
					sucessfulSmeltRequestMap[item['id']] = false;
					error = 'Code 7. Please contact the platform team for assistance.';
				}
			}
		}
		running = false;
	}

	/**
	 * Keeps track if @param item's slug is available or not. Is trigger on load and any time the slug is edited.
	 * @param item
	 * @returns void
	 */
	function setSlugAvailability(event, item: ImportStatus | LegacyPackage) {
		slugUnavailableMap[slugMap[item['id']]] = !event.detail;
		slugUnavailableMap = slugUnavailableMap;
		if (isItemSelectable(item)) selectedMap[item['id']] = true;
		else selectedMap[item['id']] = false;
		selectedMap = selectedMap;
	}

	/**
	 * Sets the it's slug to its id if it's slug isn't defined
	 * @returns void
	 */
	function checkIfSlugsDefined() {
		if (!results) return;
		items = [];
		slugMap = {};
		for (const item of results) {
			let itemCopy = structuredClone(item);
			items.push(itemCopy);
			itemCopy['slug'] = itemCopy['id']; // Ignore old slugs
			slugMap[itemCopy['id']] = itemCopy['id'];
		}
		items = items;
	}

	/**
	 * Sets the selected map for items in the results array
	 * @returns void
	 */
	function setSelectedModel() {
		if (!items) return;
		selectedMap = {};
		for (const item of items) {
			selectedMap[item['id']] = isItemSelectable(item);
		}
		selectedMap = selectedMap;
	}

	/**
	 * Checks to see if the item can be run through smelter or not
	 * @returns void
	 */
	function isItemSelectable(item: ImportStatus | LegacyPackage) {
		if ('status' in item) {
			return (
				!sucessfulSmeltRequestMap[item['id']] &&
				!slugUnavailableMap[slugMap[item['id']]] &&
				item['status'] !== 'not-found' &&
				item['status'] !== 'processing'
			);
		} else {
			return !sucessfulSmeltRequestMap[item['id']] && !slugUnavailableMap[slugMap[item['id']]];
		}
	}

	async function getSlugAvailability() {
		if (!items) return;
		error = '';
		const slugs: string[] = Object.values(slugMap);
		// while (slugs.length > 0) {
		// const slugBatch = slugs.splice(0, 500);
		//results.map((item) => item["id"]);
		try {
			const response = await $session.lapin.mutation(`slug.resolveMany`, slugs);

			if (response) {
				for (const slug of slugs) {
					if (response.hasOwnProperty(slug)) {
						slugUnavailableMap[slug] = true;
						noidMap[slug] = response[slug];
					} else {
						slugUnavailableMap[slug] = false;
					}
				}
			}
			/*for (const result of response) {
          if (result.length === 2) {
            const slug = result[0];
            const info = result[1];
            slugUnavailableMap[slug] = info.found;
            if (info.found && info.result) {
              noidMap[slug] = info.result.id;
            }
          }
        }*/
		} catch (e) {
			error = e?.message.includes(`"path:"`)
				? 'Code 8. Please contact the platform team for assistance.'
				: 'Code 9. Please contact the platform team for assistance. ';
		}
		//}
	}

	/**
	 * @listens results
	 * @description Calls @function checkIfSlugsDefined and @function setExpandedModel and @function setSelectedModel any time the results change. Also sets loading to re-trigger the draw of the slug resolvers
	 */
	$: {
		loading = true;
		results;
		checkIfSlugsDefined();
		getSlugAvailability().then(() => {
			setSelectedModel();
			loading = false;
		});
	}

	/*$: {
    loading = true;
    slugUnavailableMap;
    getSlugAvailability().then(() => {
      setSelectedModel();
      loading = false;
    });
  }*/
</script>

<NotificationBar message={error} status="fail" />

{#if !loading}
	<div class="button-wrap" class:disabled={!items}>
		<LoadingButton
			buttonClass="primary"
			showLoader={running}
			on:clicked={handleRunSmelterPressed}
			disabled={!(Object.keys(selectedMap).filter((key) => selectedMap[key]).length > 0)}
		>
			<span slot="content">
				{running
					? 'Importing Selected Packages into Access...'
					: 'Import Selected Packages into Access'}
			</span>
		</LoadingButton>
	</div>

	<table class="table" class:disabled={!items}>
		<thead>
			<tr>
				<th>
					<div class="t-row auto-align">
						<div class="row-check">
							<input type="checkbox" on:click={toggleAllSelected} checked />
						</div>
						<div class="row-id">AIP ID</div>
						<div class="row-status">Import Status</div>
					</div>
				</th>
			</tr>
		</thead>
		<tbody>
			{#if items}
				{#each items as item, i}
					<tr>
						<td>
							<div class="t-row auto-align">
								{#if !slugUnavailableMap[slugMap[item['id']]] && !('status' in item && item.status === 'processing') && !('status' in item && item.status === 'not-found')}
									<div class="row-check">
										<input
											type="checkbox"
											on:click={() => handleItemSelected(item)}
											checked={selectedMap[item['id']]}
										/>
									</div>
									<div class="row-id">{item['id']}</div>
									<div class="row-status success">Ready to import!</div>
								{:else}
									<div class="row-check">
										<input type="checkbox" disabled />
									</div>
									<div class="row-id">{item['id']}</div>
									<div class="row-status fail">Unable to import.</div>
								{/if}
							</div>
						</td>
					</tr>

					<tr class="row-detail">
						<td>
							{#if 'status' in item && item.status === 'not-found'}
								'{item['id']}' was not found. {isSlugSearch
									? 'Are you sure your manifest was derived from a preservation package?'
									: ''}
							{:else if 'status' in item && item.status === 'processing'}
								This package is currently being imported. <a target="_blank" href="/smelter/queue"
									>Track its status in the 'Import Queue' tab.</a
								>
							{:else}
								<p class="slug-label">
									Please enter the slug for the manifest that will be created:
								</p>
								<SlugSearch
									bind:slug={slugMap[item['id']]}
									tooltip={`
The slug entered is currently in use. To resolve this issue, you can either:
  1. Enter a new slug below 
  2. Edit the slug of the 
       existing manifest
  3. Delete the existing 
       manifest
                  `}
									searchOnLoad={false}
									found={slugUnavailableMap[slugMap[item['id']]]}
									noid={slugMap[item['id']] in noidMap ? noidMap[slugMap[item['id']]] : null}
									on:slugValidity={(e) => {
										setSlugAvailability(e, item);
									}}
								/>
								<br />
								<br />
								<div class="import-history-wrap">
									<div class="accordion" id="">
										<div class="accordion-item">
											<h2 class="accordion-header" id="">
												<button
													class="btn accordion-button"
													type="button"
													data-bs-toggle="collapse"
													data-bs-target={`#last-import-status-${i}`}
													aria-expanded="false"
													aria-controls={`last-import-status-${i}`}
												>
													Last Import Status
												</button>
											</h2>
											<div
												id={`last-import-status-${i}`}
												class="accordion-collapse collapse show"
												aria-labelledby="panelsStayOpen-headingOne"
											>
												<div class="accordion-body">
													<DipstatingImportStatus bind:item />
												</div>
											</div>
										</div>
									</div>
								</div>
							{/if}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
{:else}
	<div class="loading">
		<Loading backgroundType="gradient" />
	</div>
{/if}

<style>
	.button-wrap {
		text-align: right;
	}
	table {
		margin-top: 2rem;
		width: 100%;
		overflow-y: auto;
	}
	.t-row {
		width: 100%;
	}
	.row-check {
		margin-right: 1rem;
	}
	.row-id {
		flex: 9;
	}
	.row-detail {
		background-color: white;
	}
	.row-detail > td {
		padding: 2rem 4rem !important;
	}
	.row-status.success {
		color: var(--success);
	}
	.row-status.fail {
		color: var(--danger);
	}
	.import-history-wrap {
		border-radius: var(--border-radius);
		border: 1px solid var(--border-color);
		padding: 1rem;
	}
	.slug-label {
		margin-bottom: 1rem;
	}
	.slug-error-instructions {
		margin-top: 1rem;
		color: var(--secondary);
	}
	tbody {
		background: whitesmoke;
	}
</style>
