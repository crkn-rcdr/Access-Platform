<script lang="ts">
	import type { DMDTask, ShortTaskType } from '@crkn-rcdr/access-data';
	import Paginator from '../shared/Paginator.svelte';
	import { getStores, page } from '$app/stores';
	import type { Session } from '$lib/types';
	import { showConfirmation } from '$lib/utils/confirmation';
	import { onMount } from 'svelte';

	/**
	 * @type { DMDTask } The dmd task being displayed
	 */
	export let dmdTask: DMDTask;
	export let totalItems: number = 0;
	export let totalPages: number = 0;
	export let currentPage = 1;

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	let filters: any = {};
	let pageSize = 100;
	let shouldCreateAllItems = true;

	async function getPage() {
		await showConfirmation(
			async () => {
				try {
					const pageData = await $session.lapin.query('dmdTask.page', {
						id: dmdTask.id,
						page: currentPage,
						limit: 100,
						filters
					});
					if (pageData) {
						if (pageData.list) dmdTask['items'] = pageData.list;
						if (pageData.totalItems) totalItems = pageData.totalItems;
						if (pageData.totalPages) totalPages = pageData.totalPages;
						dmdTask = dmdTask;
					}
					return {
						success: true
					};
				} catch (e) {
					return {
						success: false,
						details: e?.message
					};
				}
			},
			'',
			'Error: failed to get page data.',
			true
		);
	}

	async function handlePageChange(event: any) {
		currentPage = event.detail.page;
		await getPage();
	}

	async function setAllItemsSelected() {
		//shouldCreateAllItems = !shouldCreateAllItems;
		await showConfirmation(
			async () => {
				try {
					await $session.lapin.mutation('dmdTask.setAllItemsShouldCreate', {
						id: dmdTask['id'],
						value: shouldCreateAllItems,
						user: $session.user
					});

					return {
						success: true
					};
				} catch (e) {
					return {
						success: false,
						details: e?.message
					};
				}
			},
			'',
			'Error: failed to save selection.',
			true
		);
	}

	async function handleChange(item, index) {
		let paginatedIndex = index * currentPage;
		await showConfirmation(
			async () => {
				try {
					//item['shouldCreate'] = !item['shouldCreate'];
					await $session.lapin.mutation('dmdTask.setItemShouldCreate', {
						id: dmdTask['id'],
						index: paginatedIndex,
						value: item['shouldCreate'],
						user: $session.user
					});

					return {
						success: true
					};
				} catch (e) {
					return {
						success: false,
						details: e?.message
					};
				}
			},
			'',
			'Error: failed to save selection.',
			true
		);
	}

	function setModel() {
		for (let i in dmdTask['items']) {
			dmdTask['items'][i]['shouldCreate'] = true;
		}
		dmdTask = dmdTask;
	}

	onMount(() => {
		setAllItemsSelected().then(() => {
			console.log('Done');
			setModel();
		});
	});
</script>

{#if dmdTask}
	<div class="create-list-create-all">
		<input type="checkbox" bind:checked={shouldCreateAllItems} on:change={setAllItemsSelected} />
		<span>Select all</span>
	</div>
	{#each dmdTask['items'] as item, i}
		{#if ('found' in item && !item.found) || ('stored' in item && !item.stored && 'shouldCreate' in item && typeof item['shouldCreate'] !== 'undefined')}
			<div class="create-list auto-align auto-align__j-start">
				<input
					type="checkbox"
					bind:checked={item['shouldCreate']}
					on:change={async () => {
						await handleChange(item, i);
					}}
				/>
				<span>
					<b>{item.id}</b>
				</span>
				<p>{item.label}</p>
			</div>
		{/if}
	{/each}

	<Paginator
		bind:page={currentPage}
		bind:pageSize
		pageSizeEditable={false}
		count={totalItems}
		on:change={handlePageChange}
	/>
	<br />
	<br />
	<br />
	<br />
	<br />
{:else}
	No items.
{/if}

<style>
	.create-list-create-all {
		margin-bottom: 1rem;
		margin-left: 1.3rem;
	}

	.create-list-create-all input {
		margin-right: 0.6rem;
	}

	.create-list {
		width: 100%;
		padding: 15px 20px;
		/*border: 1px solid var(--border-color);
		margin-bottom: 1rem;
		border-radius: var(--border-radius);*/
	}

	.create-list > * {
		margin-right: 1rem;
	}

	.create-list > *:not(input) {
		margin-top: 0;
	}

	.create-list > input {
		margin-top: 0.4rem;
	}
</style>
