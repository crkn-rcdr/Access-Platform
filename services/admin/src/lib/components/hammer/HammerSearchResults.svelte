<script lang="ts">
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import LoadingButton from '$lib/components/shared/LoadingButton.svelte';
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/**
	 * @type {any[]}
	 * The packages in the format of <todo>, to be displayed to the user/
	 */
	export let results: any[];
	let noidList: string[] = [];
	let loading: boolean = false;
	let result: any;
	let success: boolean = false;
	let error = '';

	async function handleForceUpdate() {
		try {
			loading = true;
			success = false;
			const response = await $session.lapin.mutation('accessObject.bulkForceUpdate', noidList);
			if (response) result = response;
			loading = false;
			success = true;
		} catch (e) {
			console.log(e);
			error = e.message;
		}
	}

	function handleItemSelected(item: any, e: any) {
		item['selected'] = e.target.checked;
		if (item['selected']) {
			noidList.push(item['noid']);
		} else {
			noidList = noidList.filter((el) => el !== item['noid']);
		}
	}

	$: {
		if (results) {
			noidList = [];
			for (let result of results) {
				if (result['selected']) {
					noidList.push(result['noid']);
				} else {
					noidList = noidList.filter((el) => el['noid'] !== result['noid']);
				}
			}
		}
	}
</script>

{#if success}
	<NotificationBar message={'Data transfer forces successfully'} status="success" />
{/if}
<NotificationBar message={error} status="fail" />

{#if results && results.length}
	<LoadingButton buttonClass="secondary" on:clicked={handleForceUpdate} showLoader={loading}>
		<span slot="content">{loading ? 'Forcing update...' : 'Force update'} </span>
	</LoadingButton>
{/if}

<table class="table">
	<thead>
		<td> Select </td>
		<td> Slug </td>
	</thead>
	{#if !loading}
		<tbody>
			{#if results}
				{#if results.length}
					{#each results as result}
						<tr>
							<td>
								<input
									disabled={!result['found']}
									type="checkbox"
									on:click={(e) => handleItemSelected(result, e)}
									checked={result['selected']}
								/>
							</td>

							<td>
								{result['slug']}
								{#if !result['found']}
									- Item not found
								{/if}
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="4"> No results </td>
					</tr>
				{/if}
			{:else}
				<tr>
					<td colspan="4"> Search results will appear here </td>
				</tr>
			{/if}
		</tbody>
	{/if}
</table>

<style>
	button {
		float: right;
	}
</style>
