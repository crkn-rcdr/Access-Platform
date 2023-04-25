<script lang="ts">
	import { goto } from '$app/navigation';
	import { getStores } from '$app/stores';

	import ManifestSelector from '$lib/components/manifests/ManifestSelector.svelte';
	import Loading from '$lib/components/shared/Loading.svelte';
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';
	import Wizard from '$lib/components/shared/Wizard.svelte';
	import type { Session } from '$lib/types';
	import { showConfirmation } from '$lib/utils/confirmation';
	import { Slug } from '@crkn-rcdr/access-data';

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	let selectedManifests: any[] = [];
	let batchName: Slug = '';
	let validSlug = true;
	let loading: boolean = false;

	function handleManifestSelectionChange(event: any) {
		selectedManifests = event.detail;
	}

	function handleCancelPressed() {
		goto('/ocr');
	}

	async function handleCreatePressed() {
		loading = true;
		await showConfirmation(
			async () => {
				try {
					const response = await $session.lapin.mutation(`ocr.create`, {
						user: $session.user,
						name: batchName,
						manifests: selectedManifests
					});
					if (response) {
						goto('/ocr');
					}
					loading = false;
					return {
						success: true,
						details: ''
					};
				} catch (e) {
					loading = false;
					return {
						success: false,
						details: e.message
					};
				}
			},
			'Success: batch created and queued for exporting.',
			'Error: failed create and queue batch for exporting.'
		);
	}

	$: validSlug = batchName.length ? Slug.safeParse(batchName).success : true;
</script>

<Wizard title="Create OCR Batch">
	{#if loading}
		<div class="loader">
			<Loading backgroundType="gradient" />
		</div>
	{:else}
		<label>
			<h6>Enter an Identifiable Batch Name</h6>
			{#if !validSlug}
				<NotificationBar
					status="fail"
					message="Batch name can only contain letters, numbers, and the following symbols: _ - ."
				/>
			{/if}
			<input bind:value={batchName} />
		</label>
		<br />
		<br />

		<h6>Search for Canvases by Manifest</h6>
		<div class="auto-align canvas-select">
			<ManifestSelector on:change={handleManifestSelectionChange} />
		</div>

		<div class="wizard-buttons">
			<button class="btn secondary" on:click={handleCancelPressed}>Cancel</button>
			<button
				on:click={handleCreatePressed}
				class="btn save"
				disabled={!selectedManifests?.length || !batchName.length || !validSlug}
			>
				Create OCR Batch
			</button>
		</div>
	{/if}
</Wizard>

<style>
	.canvas-select,
	input {
		width: 100%;
	}
	.wizard-buttons {
		position: absolute;
		bottom: var(--perfect-fourth-4);
		right: var(--perfect-fourth-4);
		z-index: 1;
		height: fit-content;
		background: white;
		width: 100%;
		text-align: right;
	}
	.loader {
		width: 100%;
		text-align: center;
	}
</style>
