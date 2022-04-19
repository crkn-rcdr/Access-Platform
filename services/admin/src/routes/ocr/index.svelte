<script context="module" lang="ts">
	/**
	 * @module
	 * @description loads in the object from the backend using the params in the route of the page
	 */
	import type { Load } from '@sveltejs/kit';
	import type { RootLoadOutput, Session } from '$lib/types';
	import {
		ExportFailedOcrBatch,
		ExportSucceededOcrBatch,
		ExportWaitingOcrBatch,
		ImportFailedOcrBatch,
		ImportSucceededOcrBatch,
		ImportWaitingOcrBatch,
		OcrBatch
	} from '@crkn-rcdr/access-data';

	function getOcrBatches(batchList) {
		const base: OcrBatch[] = [];
		const exportWaiting: ExportWaitingOcrBatch[] = [];
		const exportDone: (ExportSucceededOcrBatch | ExportFailedOcrBatch)[] = [];
		const importWaiting: ImportWaitingOcrBatch[] = [];
		const importDone: (ImportSucceededOcrBatch | ImportFailedOcrBatch)[] = [];

		for (const batch of batchList) {
			if (ImportSucceededOcrBatch.safeParse(batch).success) {
				importDone.push(batch as ImportSucceededOcrBatch);
			} else if (ImportFailedOcrBatch.safeParse(batch).success) {
				importDone.push(batch as ImportFailedOcrBatch);
			} else if (ImportWaitingOcrBatch.safeParse(batch).success) {
				importWaiting.push(batch as ImportWaitingOcrBatch);
			} else if (ExportSucceededOcrBatch.safeParse(batch).success) {
				exportDone.push(batch as ExportSucceededOcrBatch);
			} else if (ExportFailedOcrBatch.safeParse(batch).success) {
				exportDone.push(batch as ExportFailedOcrBatch);
			} else if (ExportWaitingOcrBatch.safeParse(batch).success) {
				exportWaiting.push(batch as ExportWaitingOcrBatch);
			} else {
				base.push(batch);
			}
		}

		return {
			props: {
				base,
				exportWaiting: exportWaiting.sort((a, b) => {
					if (a.exportProcess.requestDate > b.exportProcess.requestDate) return 1;
					else if (a.exportProcess.requestDate < b.exportProcess.requestDate) return -1;
					return 0;
				}),
				exportDone: exportDone.sort((a, b) => {
					if ('processDate' in a.exportProcess && 'processDate' in b.exportProcess) {
						if (a.exportProcess.processDate > b.exportProcess.processDate) return 1;
						if (a.exportProcess.processDate < b.exportProcess.processDate) return -1;
					}
					return 0;
				}),
				importWaiting: importWaiting.sort((a, b) => {
					if (a.importProcess.requestDate > b.importProcess.requestDate) return 1;
					else if (a.importProcess.requestDate < b.importProcess.requestDate) return -1;
					return 0;
				}),
				importDone: importDone.sort((a, b) => {
					if ('processDate' in a.importProcess && 'processDate' in b.importProcess) {
						if (a.importProcess.processDate > b.importProcess.processDate) return 1;
						if (a.importProcess.processDate < b.importProcess.processDate) return -1;
					}
					return 0;
				})
			}
		};
	}
</script>

<script lang="ts">
	import { getStores } from '$app/stores';
	import timer from '$lib/stores/timer';
	import { onDestroy, onMount } from 'svelte';
	import ExpansionList from '$lib/components/shared/ExpansionList.svelte';
	import ExpansionListItem from '$lib/components/shared/ExpansionListItem.svelte';
	import OcrBatchActions from '$lib/components/ocr-batch/OcrBatchActions.svelte';
	import ExpansionListMessage from '$lib/components/shared/ExpansionListMessage.svelte';
	import Loading from '$lib/components/shared/Loading.svelte';
	// Typed arrays lets us avoid checks in the front end
	export let base: OcrBatch[] = [];
	export let exportWaiting: ExportWaitingOcrBatch[] = [];
	export let exportDone: (ExportSucceededOcrBatch | ExportFailedOcrBatch)[] = [];
	export let importWaiting: ImportWaitingOcrBatch[] = [];
	export let importDone: (ImportSucceededOcrBatch | ImportFailedOcrBatch)[] = [];

	let loading = true;

	let unsubscribe;
	const interval = timer({ interval: 60000 }); // 1x per min

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	async function getBatches() {
		let batchList = await $session.lapin.query('ocr.list');
		const results = getOcrBatches(batchList);
		({ base, exportWaiting, exportDone, importWaiting, importDone } = results.props);
		loading = false;
	}

	async function handleDeletePressed(array, task) {
		array = array.filter((item) => task['id'] === item['id']);
		await getBatches();
	}

	onMount(() => {
		getBatches().then(() => {
			unsubscribe = interval.subscribe(async () => {
				await getBatches();
			});
		});
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

{#if loading}
	<br />
	<br />
	<br />
	<div class="auto-align auto-align__column auto-align__block auto-align__a-center">
		<Loading backgroundType="gradient" />
		<p>Fetching OCR batches...</p>
	</div>
{:else}
	<div class="wrapper">
		<br />
		<br />
		<br />
		<div class="title auto-align auto-align__a-center">
			<h6>OCR Batches</h6>
			<a href="/ocr/new">
				<button class="create-button primary">Create New OCR Batch</button>
			</a>
		</div>

		{#if base.length}
			<ExpansionList showMessage={base?.length === 0} message="">
				<span slot="title">Awaiting Export ({base.length})</span>
				{#each base as batch}
					<ExpansionListItem status="N/A">
						<span slot="title">{batch.name}</span>
						<span slot="stage">N/A</span>
						<span slot="details">{batch.canvases.length} canvases</span>
						<span slot="actions">
							<OcrBatchActions
								{batch}
								stage="N/A"
								status="N/A"
								on:export={getBatches}
								on:delete={async () => {
									await handleDeletePressed(base, batch);
								}}
							/>
						</span>
					</ExpansionListItem>
				{/each}
			</ExpansionList>
		{/if}

		<ExpansionList showMessage={exportWaiting?.length === 0} message="No batches are exporting.">
			<span slot="title">Exporting ({exportWaiting.length})</span>
			{#each exportWaiting as batch}
				<ExpansionListItem status="waiting">
					<span slot="title">{batch.name}</span>
					<span slot="date"
						>{new Date(batch.staff.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="details">{batch.canvases.length} canvases</span>
					<span slot="actions">
						<OcrBatchActions
							{batch}
							stage="export"
							status="waiting"
							on:export={getBatches}
							on:delete={async () => {
								await handleDeletePressed(exportWaiting, batch);
							}}
						/>
					</span>
				</ExpansionListItem>
			{/each}
		</ExpansionList>

		<ExpansionList showMessage={exportDone?.length === 0} message="No batches are done exporting.">
			<span slot="title">Done Exporting ({exportDone.length})</span>
			{#each exportDone as batch}
				<ExpansionListItem
					status={batch.exportProcess['succeeded']
						? batch.exportProcess.message?.length
							? 'warning'
							: 'succeeded'
						: 'failed'}
				>
					<span slot="title">{batch.name}</span>
					<span slot="date"
						>{new Date(batch.staff.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="details">{batch.canvases.length} canvases</span>
					<span slot="actions">
						<OcrBatchActions
							{batch}
							stage="export"
							status={batch.exportProcess['succeeded'] ? 'succeeded' : 'failed'}
							on:export={getBatches}
							on:import={getBatches}
							on:delete={async () => {
								await handleDeletePressed(exportDone, batch);
							}}
						/>
					</span>
				</ExpansionListItem>
				<ExpansionListMessage
					status={batch.exportProcess['succeeded'] ? 'succeeded' : 'failed'}
					message={batch.exportProcess['message']}
				/>
			{/each}
		</ExpansionList>

		<ExpansionList showMessage={importWaiting?.length === 0} message="No batches are importing.">
			<span slot="title">
				Importing ({importWaiting.length})
			</span>
			{#each importWaiting as batch}
				<ExpansionListItem status="waiting">
					<span slot="title">{batch.name}</span>
					<span slot="date"
						>{new Date(batch.staff.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="details">{batch.canvases.length} canvases</span>
					<span slot="actions">
						<OcrBatchActions
							{batch}
							stage="import"
							status={'waiting'}
							on:cancel={getBatches}
							on:delete={async () => {
								await handleDeletePressed(importWaiting, batch);
							}}
						/>
					</span>
				</ExpansionListItem>
			{/each}
		</ExpansionList>

		<ExpansionList showMessage={importDone?.length === 0} message="No batches are done importing.">
			<span slot="title">
				Done Importing ({importDone.length})
			</span>
			{#each importDone as batch}
				<ExpansionListItem
					status={batch.importProcess['succeeded']
						? batch.importProcess.message?.length
							? 'warning'
							: 'succeeded'
						: 'failed'}
				>
					<span slot="title">{batch.name}</span>
					<span slot="date"
						>{new Date(batch.staff.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="details">{batch.canvases.length} canvases</span>
					<span slot="actions">
						<OcrBatchActions
							{batch}
							stage="import"
							status={batch.importProcess['succeeded'] ? 'succeeded' : 'failed'}
							on:import={getBatches}
							on:delete={async () => {
								await handleDeletePressed(importDone, batch);
							}}
						/>
					</span>
				</ExpansionListItem>
				<ExpansionListMessage
					status={batch.importProcess['succeeded'] ? 'succeeded' : 'failed'}
					message={batch.importProcess['message']}
				/>
			{/each}
		</ExpansionList>
		<br />
		<br />
		<br />
	</div>
{/if}

<style>
	.title {
		width: 100%;
	}
	.title h6 {
		flex: 10;
	}

	.create-button {
		flex: 2;
	}
</style>
