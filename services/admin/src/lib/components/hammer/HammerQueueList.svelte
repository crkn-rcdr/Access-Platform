<script lang="ts">
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import { onMount } from 'svelte';
	import Paginator from '../shared/Paginator.svelte';

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	let results: any[] = [];

	/**
	 * @type { boolean } If the lookup has completed or not.
	 */
	let loading: boolean = false;

	let pageNumber: number = 1;
	let count: number = 0;
	/**
	 * Sends the request to look up the items by slug to the backend and saves the results
	 * @returns void
	 */
	async function sendLookupRequest() {
		if (loading) return;
		loading = true;

		try {
			const response = await $session.lapin.mutation('accessObject.hammerQueue', {
				limit: 50,
				skip: (pageNumber - 1) * 50
			});
			if (response) {
				count = response['count'];
				results = response['results'];
			}
		} catch (e) {
			/*error = e?.message.includes(`"path:"`)
				? 'Code 1. Please contact the platform team for assistance.'
				: 'Code 2. Please contact the platform team for assistance.';*/
		}
		loading = false;
	}

	onMount(async () => {
		await sendLookupRequest();
	});
</script>

{#if count != 0}
	<Paginator
		bind:page={pageNumber}
		pageSize={50}
		{count}
		on:change={sendLookupRequest}
		pageSizeEditable={false}
	/>
{/if}
<div>
	<!--
     "selected" : found
     "slug": "oop.debates_SOC1901",
     "id": noid
     "updateInternalmeta": {
        "requestDate": "2022-12-22T04:00:43Z",
        "processDate": "2022-12-22T09:35:17Z",
        "succeeded": true,
        "message": "Item not found: 69429/m0599z033520\n"
      }
  -->
	<table>
		{#if results}
			{#if results.length}
				{#each results as result}
					<tr>
						<td>
							{result['slug']}
						</td>
						<td>
							{result['updateInternalmeta']?.['requestDate']}
						</td>
					</tr>
				{/each}
			{:else}
				No results
			{/if}
		{/if}
	</table>
</div>

{#if count != 0}
	<Paginator
		bind:page={pageNumber}
		pageSize={50}
		{count}
		on:change={sendLookupRequest}
		pageSizeEditable={false}
	/>
{/if}

<style>
</style>
