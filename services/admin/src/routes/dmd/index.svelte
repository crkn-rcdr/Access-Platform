<script context="module" lang="ts">
	import type { ShortTask } from '@crkn-rcdr/access-data';
	/**
	 * @module
	 * @description loads in the object from the backend using the params in the route of the page
	 */

	function getDMDTasks(taskList) {
		const base: ShortTask[] = [];
		const parsing: ShortTask[] = [];
		const parsed: ShortTask[] = [];
		const updating: ShortTask[] = [];
		const paused: ShortTask[] = [];
		const updated: ShortTask[] = [];

		const list = taskList.sort((a, b) => {
			const aDate = new Date(a.date).getTime();
			const bDate = new Date(b.date).getTime();

			if (aDate > bDate) return -1;
			else if (aDate < bDate) return 1;
			return 0;
		});

		for (const task of list) {
			if (task.type === 'store paused') {
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
			}
		}

		return {
			props: { base, parsed, parsing, updating, updated, paused }
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
	import ExpansionListMessage from '$lib/components/shared/ExpansionListMessage.svelte';
	import DmdTaskActions from '$lib/components/dmd/DmdTaskActions.svelte';
	import Loading from '$lib/components/shared/Loading.svelte';
	import Toggle from '$lib/components/shared/Toggle.svelte';

	// Typed arrays lets us avoid checks in the front end
	export let base: ShortTask[] = [];
	export let parsing: ShortTask[] = [];
	export let parsed: ShortTask[] = [];
	export let updating: ShortTask[] = [];
	export let paused: ShortTask[] = [];
	export let updated: ShortTask[] = [];

	let filteredBase: ShortTask[] = [];
	let filteredParsing: ShortTask[] = [];
	let filteredParsed: ShortTask[] = [];
	let filteredUpdating: ShortTask[] = [];
	let filteredPaused: ShortTask[] = [];
	let filteredUpdated: ShortTask[] = [];

	let loading = true;
	let searchTerm = '';

	let unsubscribe;
	const interval = timer({ interval: 60000 }); // 1x per min
	/**
	 * @type {NodeJS.Timeout | null} Used to debounce the filtering of tasks.
	 */
	let filterTimer: NodeJS.Timeout | null = null;
	let filters: any = {};

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
		await getDMDTasksList();
	}

	function search() {
		if (searchTerm.length) {
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
		} else {
			filteredBase = base;
			filteredParsing = parsing;
			filteredParsed = parsed;
			filteredUpdating = updating;
			filteredPaused = paused;
			filteredUpdated = updated;
		}
	}

	async function getDMDTasksList() {
		/*let taskList: ShortTask[] = await $session.lapin.mutation(
      "dmdTask.list",
      filters
    );*/
		const res = await await fetch(`${$session?.restEndpoint}dmdtask/list`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ filters })
		});
		const taskList: ShortTask[] = await res.json();
		const results = getDMDTasks(taskList);
		({ base, parsed, parsing, updating, updated, paused } = results.props);
		search();
		loading = false;
	}

	async function handleUserFilterChanged(event) {
		const toggled = event.detail;
		if (toggled) filters['user'] = $session.user.email;
		else delete filters['user'];
		// get tasks
		await getDMDTasksList();
	}

	onMount(() => {
		filters['user'] = $session.user.email;
		getDMDTasksList().then(() => {
			unsubscribe = interval.subscribe(async () => {
				await getDMDTasksList();
			});
		});
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

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
			<h6>Metadata Tasks</h6>
		</div>
		<div class="title auto-align auto-align__a-center auto-align__j-space-between">
			<Toggle toggled={true} label={'Only show my tasks'} on:toggled={handleUserFilterChanged} />
			<input
				class="task-search"
				placeholder="Search tasks by file name..."
				bind:value={searchTerm}
			/>
			<a href="/dmd/new">
				<button class="create-button primary">Parse New Metadata File</button>
			</a>
		</div>
		{#if filteredBase.length}
			<ExpansionList
				showMessage={filteredBase?.length === 0}
				toggled={filteredBase?.length !== 0}
				message=""
			>
				<span slot="title">Unable to Trigger Parse ({filteredBase.length})</span>
				{#each filteredBase as task}
					<ExpansionListItem status="N/A">
						<span slot="title">{task.fileName}</span>
						<span slot="actions">
							<DmdTaskActions
								{task}
								stage="N/A"
								status="N/A"
								on:delete={async () => {
									await handleDeletePressed(filteredBase, task);
								}}
							/>
						</span>
					</ExpansionListItem>
				{/each}
			</ExpansionList>
		{/if}

		<ExpansionList
			showMessage={filteredParsing?.length === 0}
			toggled={filteredParsing?.length !== 0}
			message="No tasks are parsing."
		>
			<span slot="title">Parsing ({filteredParsing.length})</span>
			{#each filteredParsing as task}
				<ExpansionListItem status="waiting">
					<span slot="title">{task.fileName}</span>
					<span slot="date">{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="actions">
						<DmdTaskActions
							{task}
							stage="parse"
							status="waiting"
							on:delete={async () => {
								await handleDeletePressed(filteredParsing, task);
							}}
						/>
					</span>
				</ExpansionListItem>
			{/each}
		</ExpansionList>

		<ExpansionList
			showMessage={filteredParsed?.length === 0}
			toggled={filteredParsed?.length !== 0}
			message="No tasks have been parsed."
		>
			<span slot="title">Parsed ({filteredParsed.length})</span>
			{#each filteredParsed as task}
				<ExpansionListItem
					status={task.type === 'parse succeeded'
						? task.message?.length
							? 'warning'
							: 'succeeded'
						: 'failed'}
				>
					<span slot="title">{task.fileName}</span>
					<span slot="date">{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="details">
						{task.count} items
					</span>
					<span slot="actions">
						<DmdTaskActions
							{task}
							stage="parse"
							status={task.type === 'parse succeeded' ? 'succeeded' : 'failed'}
							on:delete={async () => {
								await handleDeletePressed(filteredParsed, task);
							}}
						/>
					</span>
				</ExpansionListItem>
				<ExpansionListMessage
					status={task.type === 'parse succeeded' ? 'succeeded' : 'failed'}
					message={task.message}
				/>
			{/each}
		</ExpansionList>

		<ExpansionList
			showMessage={filteredUpdating?.length === 0}
			toggled={filteredUpdating?.length !== 0}
			message="No tasks are loading."
		>
			<span slot="title">Storing ({filteredUpdating.length})</span>
			{#each filteredUpdating as task}
				<ExpansionListItem status="waiting">
					<span slot="title">{task.fileName}</span>
					<span slot="date">{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="details">{task.count} items</span>
					<span slot="actions">
						<DmdTaskActions
							{task}
							stage="load"
							status="waiting"
							on:delete={async () => {
								await handleDeletePressed(filteredUpdating, task);
							}}
						/>
					</span>
				</ExpansionListItem>
			{/each}
		</ExpansionList>

		<ExpansionList
			showMessage={filteredPaused?.length === 0}
			toggled={filteredPaused?.length !== 0}
			message="No tasks have been paused."
		>
			<span slot="title">Store Paused ({filteredPaused.length})</span>
			{#each filteredPaused as task}
				<ExpansionListItem status="paused">
					<span slot="title">{task.fileName}</span>
					<span slot="date">{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="details">{task.count} items</span>
					<span slot="actions">
						<DmdTaskActions
							{task}
							stage="load"
							status={'paused'}
							on:delete={async () => {
								await handleDeletePressed(filteredPaused, task);
							}}
						/>
					</span>
				</ExpansionListItem>
				<ExpansionListMessage status="succeeded" message={task.message} />
			{/each}
		</ExpansionList>

		<ExpansionList
			showMessage={filteredUpdated?.length === 0}
			toggled={filteredUpdated?.length !== 0}
			message="No tasks have been completed."
		>
			<span slot="title">Store Completed ({filteredUpdated.length})</span>
			{#each filteredUpdated as task}
				<ExpansionListItem
					status={task.type === 'store succeeded'
						? task.message?.length
							? 'warning'
							: 'succeeded'
						: 'failed'}
				>
					<span slot="title">{task.fileName}</span>
					<span slot="date">{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
					>
					<span slot="details">{task.count} items</span>
					<span slot="actions">
						<DmdTaskActions
							{task}
							stage="load"
							status={task.type === 'store succeeded' ? 'succeeded' : 'failed'}
							on:delete={async () => {
								await handleDeletePressed(filteredUpdated, task);
							}}
						/>
					</span>
				</ExpansionListItem>
				<ExpansionListMessage
					status={task.type === 'store succeeded' ? 'succeeded' : 'failed'}
					message={task.message}
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
	.task-search {
		flex: 1;
		margin: 0 4rem;
	}
</style>
