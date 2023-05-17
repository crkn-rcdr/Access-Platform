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
	import OcrBatchActions from '$lib/components/ocr-batch/OcrBatchActions.svelte';
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

	async function handleStatusButtonPressed(fromArray, toArray, task) {
		fromArray = fromArray.filter((item) => task['id'] === item['id']);
		toArray.push(task);
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
		<a href="/ocr/ocr-pdf" class="ocr-pdf-link">Bulk OCR PDF Generation</a>
		<br />
		<br />
		<br />
		<div class="title auto-align auto-align__a-center">
			<h6 class="h6">OCR Batches</h6>
			<a href="/ocr/new">
				<button class="btn create-button primary">Create New OCR Batch</button>
			</a>
		</div>
		<br />
		<br />
		<div class="accordion" id="">
			{#if base.length}
				<div class="accordion-item">
					<h2 class="accordion-header" id="">
						<button
							class="btn accordion-button collapsed"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target={`#base-g`}
							aria-expanded="false"
							aria-controls={`base-g`}>Awaiting Export ({base.length})</button
						>
					</h2>
					<div
						id={`base-g`}
						class={`accordion-collapse collapse ${base.length ? 'show' : ''}`}
						aria-labelledby="panelsStayOpen-headingOne"
					>
						<div class="accordion-body">
							<div class="accordion" id="">
								<!--"No tasks have been completed."-->

								{#each base as batch, i}
									<div class="accordion-item">
										<h2 class="accordion-header" id="">
											<button
												class="btn accordion-button"
												type="button"
												data-bs-toggle="collapse"
												data-bs-target={`#base-${i}`}
												aria-expanded="false"
												aria-controls={`base-${i}`}>{batch.name}</button
											>
										</h2>
										<div
											id={`base-${i}`}
											class="accordion-collapse collapse show"
											aria-labelledby="panelsStayOpen-headingOne"
										>
											<div class="accordion-body">
												<div class="detail-body">
													<span>{batch.canvases.length} canvases</span>
													<span>
														<OcrBatchActions
															{batch}
															stage="N/A"
															status="N/A"
															on:export={async () => {
																await handleStatusButtonPressed(base, exportWaiting, batch);
															}}
															on:delete={async () => {
																await handleDeletePressed(base, batch);
															}}
														/>
													</span>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="accordion-item">
				<h2 class="accordion-header" id="">
					<button
						class="btn accordion-button collapsed"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target={`#base-e`}
						aria-expanded="false"
						aria-controls={`base-e`}
					>
						Exporting ({exportWaiting.length})</button
					>
				</h2>
				<div
					id={`base-e`}
					class={`accordion-collapse collapse ${exportWaiting.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							<!--"No tasks are exporting."-->
							{#each exportWaiting as batch, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#waite-${i}`}
											aria-expanded="false"
											aria-controls={`waite-${i}`}>{batch.name}</button
										>
									</h2>
									<div
										id={`waite-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<div class="detail-body">
												<span
													>{new Date(batch.staff.date)
														.toLocaleString()
														.replace(/:[0-9][0-9]$/, '')}</span
												>
												<span>{batch.canvases.length} canvases</span>
												<span>
													<OcrBatchActions
														{batch}
														stage="export"
														status="waiting"
														on:cancel={async () => {
															await handleStatusButtonPressed(exportWaiting, base, batch);
														}}
														on:delete={async () => {
															await handleDeletePressed(exportWaiting, batch);
														}}
													/>
												</span>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="accordion-item">
				<h2 class="accordion-header" id="">
					<button
						class="btn accordion-button collapsed"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target={`#base-ed`}
						aria-expanded="false"
						aria-controls={`base-ed`}>Exported ({exportDone.length})</button
					>
				</h2>
				<div
					id={`base-ed`}
					class={`accordion-collapse collapse ${exportDone.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							<!--"No tasks have been exported."-->
							{#each exportDone as batch, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#e-${i}`}
											aria-expanded="false"
											aria-controls={`e-${i}`}
											>{batch.name} ({batch.exportProcess['succeeded']
												? 'succeeded'
												: 'failed'})</button
										>
									</h2>
									<div
										id={`e-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<div class="detail-body">
												<span
													>{new Date(batch.staff.date)
														.toLocaleString()
														.replace(/:[0-9][0-9]$/, '')}</span
												>
												<span>{batch.canvases.length} canvases</span>
												<span>
													<OcrBatchActions
														{batch}
														stage="import"
														status={'waiting'}
														on:cancel={async () => {
															await handleStatusButtonPressed(importWaiting, exportDone, batch);
														}}
														on:delete={async () => {
															await handleDeletePressed(importWaiting, batch);
														}}
													/>
												</span>
											</div>
											<pre>{batch.exportProcess['message']}</pre>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="accordion-item">
				<h2 class="accordion-header" id="">
					<button
						class="btn accordion-button collapsed"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target={`#base-i`}
						aria-expanded="false"
						aria-controls={`base-i`}>Importing ({importWaiting.length})</button
					>
				</h2>
				<div
					id={`base-i`}
					class={`accordion-collapse collapse ${importWaiting.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							<!--"No tasks are importing."-->
							{#each importWaiting as batch, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#iw-${i}`}
											aria-expanded="false"
											aria-controls={`iw-${i}`}>{batch.name}</button
										>
									</h2>
									<div
										id={`iw-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<span>waiting...</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="accordion-item">
				<h2 class="accordion-header" id="">
					<button
						class="btn accordion-button collapsed"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target={`#base-id`}
						aria-expanded="false"
						aria-controls={`base-id`}>Imported ({importDone.length})</button
					>
				</h2>
				<div
					id={`base-id`}
					class={`accordion-collapse collapse ${importDone.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							<!--"No tasks have been imported."-->
							{#each importDone as batch, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#i-${i}`}
											aria-expanded="false"
											aria-controls={`i-${i}`}
											>{batch.name} ({batch.importProcess['succeeded']
												? 'succeeded'
												: 'failed'})</button
										>
									</h2>
									<div
										id={`i-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<div class="detail-body">
												<span
													>{new Date(batch.staff.date)
														.toLocaleString()
														.replace(/:[0-9][0-9]$/, '')}</span
												>
												<span>{batch.canvases.length} canvases</span>
												<span>
													<OcrBatchActions
														{batch}
														stage="import"
														status={batch.importProcess['succeeded'] ? 'succeeded' : 'failed'}
														on:import={async () => {
															await handleStatusButtonPressed(importDone, importWaiting, batch);
														}}
														on:delete={async () => {
															await handleDeletePressed(importDone, batch);
														}}
													/>
												</span>
											</div>
											<pre>{batch.importProcess['message']}</pre>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
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
	.detail-body {
		display: flex;
		justify-content: space-between;
	}
	.ocr-pdf-link {
		color: var(--primary) !important;
	}
</style>
