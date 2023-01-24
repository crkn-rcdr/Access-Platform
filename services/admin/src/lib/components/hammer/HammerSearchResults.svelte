<script lang="ts">
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
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

	let result: any;

	async function handleForceUpdate() {
		const response = await $session.lapin.mutation('accessObject.bulkForceUpdate', noidList);
		if (response) result = response;
	}

	function handleItemSelected(item: any) {
		console.log(item);
		if (result['selected']) {
			noidList.push(item['noid']);
		} else {
			noidList = noidList.filter((el) => el['noid'] !== item['noid']);
		}
	}

	$: {
		console.log('rinning');
		if (results) {
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

{#if results && results.length}
	<button on:click={handleForceUpdate}>Force update</button>
{/if}
<table>
	{#if results}
		{#if results.length}
			<thead>
				<td> Select </td>
				<td> Slug </td>
			</thead>
			<tbody>
				{#each results as result}
					<tr>
						<td>
							<input
								type="checkbox"
								on:click={() => handleItemSelected(result['noid'])}
								checked={result['selected']}
							/>
						</td>
						<td>
							{result['slug']}
						</td>
					</tr>
				{/each}
			</tbody>
		{:else}
			No results
		{/if}
	{/if}
</table>

<style>
	button {
		float: right;
	}
</style>
