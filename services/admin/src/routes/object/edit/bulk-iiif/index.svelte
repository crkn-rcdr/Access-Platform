<script context="module" lang="ts">
	import type { ShortIIIFTask } from '@crkn-rcdr/access-data';
	/**
	 * @module
	 * @description loads in the object from the backend using the params in the route of the page
	 */

	function getIIIFTasks(taskList) {
		const queued: ShortIIIFTask[] = [];
		const completed: ShortIIIFTask[] = [];

		const list = taskList.sort((a, b) => {
			const aDate = new Date(a.date).getTime();
			const bDate = new Date(b.date).getTime();

			if (aDate > bDate) return -1;
			else if (aDate < bDate) return 1;
			return 0;
		});

		for (const task of list) {
			if (task.type === 'queued') {
				queued.push(task);
			} else {
				completed.push(task);
			}

			/*if (task.type === 'store paused') {
				paused.push(task);
			} else if (task.type === 'store succeeded' || task.type === 'store failed') {
				updated.push(task);
			} else if (task.type === 'store queued' || task.type === 'storing') {
				updating.push(task);
			} else if (task.type === 'parse succeeded' || task.type === 'parse failed') {
				parsed.push(task);
			} else if (task.type === 'parse queued' || task.type === 'parsing') {
				parsing.push(task);
			} else {
				base.push(task);
			}*/
		}

		return {
			props: { queued, completed }
		};
	}
</script>

<script lang="ts">
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import timer from '$lib/stores/timer';
	import { onDestroy, onMount } from 'svelte';
	import ExpansionList from '$lib/components/shared/ExpansionList.svelte';
	import ExpansionListItem from '$lib/components/shared/ExpansionListItem.svelte';
	import Loading from '$lib/components/shared/Loading.svelte';
	import FileSelector from '$lib/components/shared/FileSelector.svelte';
	import { showConfirmation } from '$lib/utils/confirmation';
	import LoadingButton from '$lib/components/shared/LoadingButton.svelte';

	// Typed arrays lets us avoid checks in the front end
	export let queued: ShortIIIFTask[] = [];
	export let completed: ShortIIIFTask[] = [];

	let filteredQueued: ShortIIIFTask[] = [];
	let filteredCompleted: ShortIIIFTask[] = [];

	let loading = true;
	let searchTerm = '';

	let file: File;
	let state = 'ready';

	let unsubscribe;
	const interval = timer({ interval: 60000 }); // 1x per min
	/**
	 * @type {NodeJS.Timeout | null} Used to debounce the filtering of tasks.
	 */
	let filterTimer: NodeJS.Timeout | null = null;

	let filters: any = {};

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	async function handleDeletePressed(array, task) {
		array = array.filter((item) => task['id'] === item['id']);
		await getIIIFTasksList();
	}

	function search() {
		/*if (searchTerm.length) {
			if (filterTimer) clearTimeout(filterTimer);
			filterTimer = setTimeout(async () => {
				const searchTermLower = searchTerm.toLowerCase();
				filteredBase = base.filter((task) => task.fileName.includes(searchTerm));
				filteredParsing = parsing.filter((task) =>
					task.fileName.toLowerCase().includes(searchTermLower)
				);
				filteredParsed = parsed.filter((task) =>
					task.fileName.toLowerCase().includes(searchTermLower)
				);
				filteredUpdating = updating.filter((task) =>
					task.fileName.toLowerCase().includes(searchTermLower)
				);
				filteredPaused = paused.filter((task) =>
					task.fileName.toLowerCase().includes(searchTermLower)
				);
				filteredUpdated = updated.filter((task) =>
					task.fileName.toLowerCase().includes(searchTermLower)
				);
			}, 500);
		} else {*/
		filteredQueued = queued;
		filteredCompleted = completed;
		//}
	}

	async function getIIIFTasksList() {
		const res = await await fetch(`${$session?.restEndpoint}iiiftask/list`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ filters })
		});
		const taskList: ShortIIIFTask[] = await res.json();
		const results = getIIIFTasks(taskList);
		({ queued, completed } = results.props);
		search();
		loading = false;
	}

	async function handleUserFilterChanged(event) {
		const toggled = event.detail;
		if (toggled) filters['user'] = $session.user.email;
		else delete filters['user'];
		// get tasks
		await getIIIFTasksList();
	}

	onMount(() => {
		filters['user'] = $session.user.email;
		getIIIFTasksList().then(() => {
			unsubscribe = interval.subscribe(async () => {
				await getIIIFTasksList();
			});
		});
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	/**
	 * Converts the selected file into a base 64 encoded string and stores it in the @var b64EncodedMetadataFileText
	 * @returns void
	 */
	async function handleFileSelected(event: any) {
		try {
			file = event.detail;
			console.log(file);
		} catch (e) {
			console.log(e?.message);
			//errorText =
			//	'There was a formatting problem with the metadata file. Please fix it or choose another file.';
		}
	}

	/**
	 * Sends the create request to lapin. Uses @function showConfirmation to show a notification at the bottom right of the screen saying if the request was sucessful or not. If it is a success, it uses the @function goto ith the DMD task id passed as the response from the request in the url.
	 * @returns void
	 */
	async function handleCreateTask() {
		await showConfirmation(
			async () => {
				try {
					state = 'uploading';

					const data: FormData = new FormData();

					data.append('user', JSON.stringify($session.user));
					data.append('file', file);

					const res = await fetch(`${$session?.restEndpoint}iiiftask/upload`, {
						method: 'PUT',
						body: data
					});

					if (res) {
						const id = await res.text();
						state = 'ready';
						//window.location.reload();

						return {
							success: true
						};
					} else {
						return {
							success: false
						};
					}
				} catch (e) {
					console.log(e?.message);
					return {
						success: false,
						details: e?.message.includes('"path":')
							? 'Code 1. Please contact the platform team for assistance.'
							: 'Code 2-3. Please try uploading the file again. If multiple file uploads fail throughout the day, this signifies a system error, and the platform team needs to be notified.'
					};
				}
			},
			'Success! File uploaded.',
			'Error: File upload request failed.'
		);
	}

	$: {
		searchTerm;
		search();
	}
</script>

{#if loading}
	<br />
	<br />
	<br />
	<div class="auto-align auto-align__column auto-align__block auto-align__a-center">
		<Loading backgroundType="gradient" />
		<p>Fetching metadata tasks...</p>
	</div>
{:else}
	<div class="wrapper">
		<br />
		<br />
		<br />
		<div class="title auto-align auto-align__a-center auto-align__j-space-between">
			<h6>IIIF Tasks</h6>
		</div>
		<div class="title auto-align auto-align__a-center auto-align__j-space-between">
			<!--Toggle toggled={true} label={'Only show my tasks'} on:toggled={handleUserFilterChanged} />
			<input
				class="task-search"
				placeholder="Search tasks by file name..."
				bind:value={searchTerm}
			/-->
			<button class="create-button primary">New IIIF Task</button>
			<FileSelector on:change={handleFileSelected} />
			<br />
			{#if file}
				<div class="new-task-button">
					<LoadingButton
						buttonClass="primary"
						showLoader={state === 'uploading'}
						on:clicked={handleCreateTask}
						disabled={state !== 'ready'}
					>
						<span slot="content">
							{state !== 'ready'
								? state === 'uploading'
									? 'Uploading...'
									: 'Uploaded!'
								: 'Upload File'}
						</span>
					</LoadingButton>
				</div>
			{/if}
		</div>
		{#if filteredQueued.length}
			<ExpansionList
				showMessage={filteredQueued?.length === 0}
				toggled={filteredQueued?.length !== 0}
				message="No tasks have been queued."
			>
				<span slot="title">Queued ({filteredQueued.length})</span>
				{#each filteredQueued as task}
					<ExpansionListItem status="">
						<span slot="title">{task.fileName}</span>
						<span slot="actions">
							<!--<DmdTaskActions
								{task}
								stage="N/A"
								status="N/A"
								on:delete={async () => {
									await handleDeletePressed(filteredBase, task);
								}}
							/>-->
						</span>
					</ExpansionListItem>
				{/each}
			</ExpansionList>
		{/if}

		<ExpansionList
			showMessage={filteredCompleted?.length === 0}
			toggled={filteredCompleted?.length !== 0}
			message="No tasks are completed."
		>
			<span slot="title">Completed</span>
			{#each filteredCompleted as task}
				<ExpansionListItem status="">
					<span slot="title">{task.fileName}</span>
					<span slot="date">{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="actions">
						<!--todo-->
					</span>
				</ExpansionListItem>
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
	.task-search {
		flex: 1;
		margin: 0 4rem;
	}
</style>
