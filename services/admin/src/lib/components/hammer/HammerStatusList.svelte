<script lang="ts">
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import { onMount } from 'svelte';
	import Paginator from '$lib/components/shared/Paginator.svelte';
	import Loading from '$lib/components/shared/Loading.svelte';
	import LoadingButton from '$lib/components/shared/LoadingButton.svelte';
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	let results: any[] = [];
	let slugList: string[] = [];
	let loading: boolean = false;
	let disableButton: boolean = true;
	let pageNumber: number = 1;
	let count: number = 0;
	let success: boolean = false;
	let error = '';
	let lookingup = false;

	/**
	 * Sends the request to look up the items by slug to the backend and saves the results
	 * @returns void
	 */
	async function sendLookupRequest() {
		lookingup = true;
		try {
			const response = await $session.lapin.mutation('accessObject.hammerStatus', {
				limit: 50,
				skip: (pageNumber - 1) * 50
			});
			if (response) {
				count = response['count'];
				for (let res of response['results']) res['selected'] = false;
				results = response['results'];
			}
		} catch (e) {
			console.log(e);
		}
		lookingup = false;
	}

	function handleItemSelected(item: any, e: any) {
		item['selected'] = e.target.checked;
		if (item['selected']) {
			slugList.push(item['slug']);
		} else {
			slugList = slugList.filter((el) => el !== item['slug']);
		}
		if (slugList.length) disableButton = false;
		else disableButton = true;
		slugList = slugList;
	}

	async function handleClearPressed() {
		loading = true;
		success = false;
		try {
			const response = await $session.lapin.mutation('accessObject.cancelHammerMany', {
				slugs: slugList,
				user: $session.user
			});
			if (response) console.log(response);
			await sendLookupRequest();
			success = true;
		} catch (e) {
			error = e.message;
		}
		loading = false;
	}

	onMount(async () => {
		await sendLookupRequest();
	});
</script>

{#if success}
	<NotificationBar message={'Messages cleared successfully'} status="success" />
{/if}
<NotificationBar message={error} status="fail" />

<div class="auto-align">
	<LoadingButton
		disabled={disableButton}
		buttonClass="secondary"
		on:clicked={handleClearPressed}
		showLoader={loading}
	>
		<span slot="content">{loading ? 'Clearing messages...' : 'Clear messages'} </span>
	</LoadingButton>

	{#if count != 0}
		<div class="pages-upper">
			<Paginator
				bind:page={pageNumber}
				pageSize={50}
				{count}
				on:change={sendLookupRequest}
				pageSizeEditable={false}
			/>
		</div>
	{/if}
</div>
<div class="">
	<table>
		<thead>
			<tr>
				<th>Select</th>
				<th>Slug</th>
				<th>Request Date</th>
				<th>Process Date</th>
				<th>Succeeded</th>
			</tr>
		</thead>
		<tbody>
			{#if results && !lookingup}
				{#if results.length}
					{#each results as result}
						<tr>
							<td>
								<input
									type="checkbox"
									on:click={(e) => handleItemSelected(result, e)}
									checked={result['selected']}
								/>
							</td>
							<td>
								{result['slug']}
							</td>
							<td>
								{result['updateInternalmeta']?.['requestDate']}
							</td>
							<td>
								{result['updateInternalmeta']?.['processDate']}
							</td>
							<td>
								{result['updateInternalmeta']?.['succeeded'] ? 'Yes' : 'no'}
							</td>
						</tr>
						<tr class="row-details">
							<td />
							<td colspan="4">
								{result['updateInternalmeta']?.['message']}
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="5">No results</td>
					</tr>
				{/if}
			{/if}
		</tbody>
	</table>
	{#if lookingup}
		<br />
		<div class="loader">
			<Loading size="md" backgroundType="gradient" />
		</div>
	{/if}

	{#if count != 0}
		<Paginator
			bind:page={pageNumber}
			pageSize={50}
			{count}
			on:change={sendLookupRequest}
			pageSizeEditable={false}
		/>
	{/if}
</div>

<style>
	.row-details {
		color: var(--secondary);
		filter: brightness(0.98);
	}
	.pages-upper {
		flex: 10;
	}
</style>
