<script context="module" lang="ts">
	/**
	 * @module
	 * @description loads in the dmdtask from the backend using the params in the route of the page
	 */
	import type { Load } from '@sveltejs/kit';
	import type { RootLoadOutput } from '$lib/types';
	export const load: Load<RootLoadOutput> = async ({ params, stuff }) => {
		try {
			if (params?.['taskid']) {
				return {
					props: {
						id: params?.['taskid']
					}
				};
			}
			return { props: {} };
		} catch (e) {
			return {
				props: {
					error: 'Code 15. Please contact the platform team for assistance.'
				}
			};
		}
	};
</script>

<script lang="ts">
	/**
	 * @file
	 * @description This page displays the various states of and information about a dmdtask
	 */
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import type { DMDTask, ShortTaskType } from '@crkn-rcdr/access-data';
	import DmdItemsTable from '$lib/components/dmd/DmdItemsTable.svelte';
	import DmdUpdateSuccessOptions from '$lib/components/dmd/DmdUpdateSuccessOptions.svelte';
	import DmdUpdateOptions from '$lib/components/dmd/DmdUpdateOptions.svelte';
	import DmdUpdateProgress from '$lib/components/dmd/DmdUpdateProgress.svelte';
	import DmdUpdateFailedOptions from '$lib/components/dmd/DmdUpdateFailedOptions.svelte';
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';
	import DmdParseTracker from '$lib/components/dmd/DmdParseTracker.svelte';
	import DmdParseFailedOptions from '$lib/components/dmd/DmdParseFailedOptions.svelte';
	import DmdUpdatePausedOptions from '$lib/components/dmd/DmdUpdatePausedOptions.svelte';
	import { afterUpdate, onMount } from 'svelte';
	import Loading from '$lib/components/shared/Loading.svelte';

	export let id: string;
	export let error: any;

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/**
	 * @type {DMDTask} The dmdtask being displayed by the page.
	 */
	let dmdTask: DMDTask;

	let type: ShortTaskType;

	let totalItems: number = 0;

	let totalPages: number = 0;

	let loading = true;

	let errorMsg = '';

	async function getTask() {
		loading = true;
		errorMsg = '';
		try {
			const response = await $session.lapin.query('dmdTask.get', {
				id
			});
			dmdTask = response.task;
			({ totalItems, totalPages, type } = response);
			loading = false;
			if (!dmdTask) errorMsg = `Error: Task with id '${id}' not found`;
		} catch (e) {
			errorMsg = 'There was a problem getting the task.';
			loading = false;
		}
	}

	onMount(async () => {
		if (id) await getTask();
	});
</script>

<div class="dmd-task-page-wrap">
	{#if error}
		{error?.message}
	{:else if loading}
		<div class="auto-align auto-align__block auto-align__j-center">
			<Loading backgroundType="gradient" />
		</div>
	{:else if errorMsg.length}
		{errorMsg}
	{:else if !dmdTask}
		Loading...
	{:else if type === 'store paused'}
		<DmdUpdatePausedOptions bind:dmdTask />
		<DmdItemsTable bind:dmdTask bind:type bind:totalItems bind:totalPages />
	{:else if type === 'store succeeded'}
		<DmdUpdateSuccessOptions bind:dmdTask />
		<DmdItemsTable bind:dmdTask bind:type bind:totalItems bind:totalPages />
	{:else if type === 'store failed'}
		<DmdUpdateFailedOptions bind:dmdTask />
		<DmdItemsTable bind:dmdTask bind:type bind:totalItems bind:totalPages />
	{:else if type === 'store queued' || type === 'storing'}
		<DmdUpdateProgress bind:dmdTask bind:type bind:totalItems bind:totalPages />
	{:else if type === 'parse succeeded'}
		<DmdUpdateOptions bind:dmdTask bind:type bind:totalItems bind:totalPages />
	{:else if type === 'parse failed'}
		<DmdParseFailedOptions bind:dmdTask />
	{:else if type === 'parsing' || type === 'parse queued'}
		<DmdParseTracker bind:dmdTask />
	{:else}
		<NotificationBar message="Something went wrong." status="fail" />
	{/if}
</div>

<style>
	:global(.dmd-task-page-wrap .failure .notification-bar) {
		width: 30rem;
	}
</style>
