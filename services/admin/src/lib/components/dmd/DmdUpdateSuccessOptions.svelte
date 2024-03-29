<script lang="ts">
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import IoMdRefresh from 'svelte-icons/io/IoMdRefresh.svelte';
	import IoMdOpen from 'svelte-icons/io/IoMdOpen.svelte';
	import type { DMDTask } from '@crkn-rcdr/access-data';
	import { onMount } from 'svelte';
	import NotificationBar from '../shared/NotificationBar.svelte';
	import LoadingButton from '../shared/LoadingButton.svelte';
	import { showConfirmation } from '$lib/utils/confirmation';

	/**
	 *  @type { DMDTask } The DMDTask being processed.
	 */
	export let dmdTask: DMDTask;

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	let githubLink = '';
	let sendingReprocessRequest = false;
	let sendingDownloadRequest = false;

	async function handleReprocessClicked() {
		await showConfirmation(
			async () => {
				try {
					// reset task to validated and refresh
					sendingReprocessRequest = true;
					await $session.lapin.mutation('dmdTask.resetStorageResult', {
						id: dmdTask.id,
						user: $session.user
					});
					window.location.reload();
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
			'Error: failed to reset task.',
			true
		);
	}

	onMount(() => {
		const newLine = '%0A';
		const title = 'title=DMD Task Item Updates Not Propagating';
		const label = 'labels[]=bug';
		const date = new Date().toISOString();
		const userName = $session.user.name;
		const body = `body=Task Id: ${dmdTask.id}${newLine}${newLine}Link: https://access.canadiana.ca/dmd/${dmdTask.id}${newLine}${newLine}When: ${date}${newLine}${newLine}Who: ${userName}${newLine}${newLine}Affected Slugs:${newLine}(Please type the affected slugs here)${newLine}${newLine}Or, please attach a screenshot:${newLine}(drag and drop it here)${newLine}`;

		githubLink =
			`https://github.com/crkn-rcdr/Access-Platform/issues/new?${title}&${body}&${label}`.replace(
				' ',
				'+'
			);
	});

	async function handleDownloadPressed() {
		await showConfirmation(
			async () => {
				try {
					sendingDownloadRequest = true;
					const link = `${$session?.restEndpoint}dmdtask/resultCSV/${dmdTask.id}`;

					console.log(link);
					const res = await await fetch(link, {
						method: 'GET'
					});
					const fileBlob = await res.blob();
					const url = window.URL.createObjectURL(fileBlob);
					const a = document.createElement('a');
					a.href = url;
					a.download = 'export.csv';
					document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
					a.click();
					a.remove(); //afterwards we remove the element again
					URL.revokeObjectURL(url);

					sendingDownloadRequest = false;
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
			'Error: failed to download results.',
			true
		);
	}
</script>

{#if dmdTask}
	{#if dmdTask?.fileName}
		<h5>{dmdTask.fileName}</h5>
	{/if}

	<NotificationBar message={`Store Complete!`} status="success" />

	{#if dmdTask['process']?.['message']?.length}
		<br />
	{/if}
	<NotificationBar message={dmdTask['process']?.['message']} status="warn" />

	<br />

	<div class="button-wrap auto-align">
		<LoadingButton
			buttonClass="primary"
			on:clicked={handleDownloadPressed}
			showLoader={sendingDownloadRequest}
		>
			<span slot="content" class="auto-align auto-align__a-center"> Download Results </span>
		</LoadingButton>
		<LoadingButton
			buttonClass="secondary"
			on:clicked={handleReprocessClicked}
			showLoader={sendingReprocessRequest}
		>
			<span slot="content" class="auto-align auto-align__a-center"> Re-process File </span>
		</LoadingButton>
	</div>
	<br />
{/if}

<style>
	.button-wrap {
		margin-bottom: 1rem;
	}
	:global(.button-wrap button) {
		margin-right: 1rem;
	}
</style>
