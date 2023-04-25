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
		<br />

		<div class="title auto-align auto-align__a-center auto-align__j-space-between">
			<Toggle toggled={true} label={'Only show my tasks'} on:toggled={handleUserFilterChanged} />
			<input
				class="task-search"
				placeholder="Search tasks by file name..."
				bind:value={searchTerm}
			/>
			<a href="/dmd/new">
				<button class="btn create-button primary">Parse New Metadata File</button>
			</a>
		</div>

		<br />
		<br />

		<div class="accordion" id="">
			{#if filteredBase.length}
				<div class="accordion-item">
					<h2 class="accordion-header" id="">
						<button
							class="btn accordion-button collapsed"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target={`#base-g`}
							aria-expanded="false"
							aria-controls={`base-g`}>Unable to Trigger Parse ({filteredBase.length})</button
						>
					</h2>
					<div
						id={`base-g`}
						class={`accordion-collapse collapse ${base.length ? 'show' : ''}`}
						aria-labelledby="panelsStayOpen-headingOne"
					>
						<div class="accordion-body">
							<div class="accordion" id="">
								{#each filteredBase as task, i}
									<div class="accordion-item">
										<h2 class="accordion-header" id="">
											<button
												class="btn accordion-button"
												type="button"
												data-bs-toggle="collapse"
												data-bs-target={`#base-${task}-${i}`}
												aria-expanded="false"
												aria-controls={`base-${task}-${i}`}
											>
												{task.fileName}
											</button>
										</h2>
										<div
											id={`base-${task}-${i}`}
											class="accordion-collapse collapse show"
											aria-labelledby="panelsStayOpen-headingOne"
										>
											<div class="accordion-body">
												<DmdTaskActions
													{task}
													stage="N/A"
													status="N/A"
													on:delete={async () => {
														await handleDeletePressed(filteredBase, task);
													}}
												/>
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
						data-bs-target={`#ps-g`}
						aria-expanded="false"
						aria-controls={`ps-g`}>Parsing ({filteredParsing.length})</button
					>
				</h2>
				<div
					id={`ps-g`}
					class={`accordion-collapse collapse ${filteredParsing.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							{#each filteredParsing as task, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#parsing-${task}-${i}`}
											aria-expanded="false"
											aria-controls={`parsing-${task}-${i}`}>{task.fileName}</button
										>
									</h2>
									<div
										id={`parsing-${task}-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<div class="detail-body">
												<span
													>{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
												>

												<DmdTaskActions
													{task}
													stage="parse"
													status="waiting"
													on:delete={async () => {
														await handleDeletePressed(filteredParsing, task);
													}}
												/>
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
						data-bs-target={`#p-g`}
						aria-expanded="false"
						aria-controls={`p-g`}>Parsed ({filteredParsed.length})</button
					>
				</h2>
				<div
					id={`p-g`}
					class={`accordion-collapse collapse ${filteredParsed.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							<!--"No tasks have been parsed."-->
							{#each filteredParsed as task, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#parsed-${task}-${i}`}
											aria-expanded="false"
											aria-controls={`parsed-${task}-${i}`}
											>{task.fileName} ({task.type === 'parse succeeded'
												? 'succeeded'
												: 'failed'})</button
										>
									</h2>
									<div
										id={`parsed-${task}-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<div class="detail-body">
												<span
													>{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
												>

												<span>{task.count} items</span>

												<DmdTaskActions
													{task}
													stage="parse"
													status={task.type === 'parse succeeded' ? 'succeeded' : 'failed'}
													on:delete={async () => {
														await handleDeletePressed(filteredParsed, task);
													}}
												/>
											</div>

											<pre>{task.message}</pre>
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
						data-bs-target={`#lg-g`}
						aria-expanded="false"
						aria-controls={`lg-g`}>Loading ({filteredUpdating.length})</button
					>
				</h2>
				<div
					id={`lg-g`}
					class={`accordion-collapse collapse ${filteredUpdating.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							<!--"No tasks are loading."-->
							{#each filteredUpdating as task, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#loading-${task}-${i}`}
											aria-expanded="false"
											aria-controls={`loading-${task}-${i}`}>{task.fileName}</button
										>
									</h2>
									<div
										id={`loading-${task}-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<div class="detail-body">
												<span
													>{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
												>
												<span>{task.count} items</span>

												<DmdTaskActions
													{task}
													stage="load"
													status="waiting"
													on:delete={async () => {
														await handleDeletePressed(filteredUpdating, task);
													}}
												/>
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
						data-bs-target={`#lp-g`}
						aria-expanded="false"
						aria-controls={`lp-g`}>Paused ({filteredPaused.length})</button
					>
				</h2>
				<div
					id={`lp-g`}
					class={`accordion-collapse collapse ${filteredPaused.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							<!--"No tasks are paused."-->
							{#each filteredPaused as task, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#paused-${task}-${i}`}
											aria-expanded="false"
											aria-controls={`paused-${task}-${i}`}>{task.fileName}</button
										>
									</h2>
									<div
										id={`paused-${task}-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<div class="detail-body">
												<span
													>{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}</span
												>
												<span>{task.count} items</span>

												<DmdTaskActions
													{task}
													stage="load"
													status={'paused'}
													on:delete={async () => {
														await handleDeletePressed(filteredPaused, task);
													}}
												/>
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
						data-bs-target={`#l-g`}
						aria-expanded="false"
						aria-controls={`l-g`}>Load Completed ({filteredUpdated.length})</button
					>
				</h2>
				<div
					id={`l-g`}
					class={`accordion-collapse collapse ${filteredUpdated.length ? 'show' : ''}`}
					aria-labelledby="panelsStayOpen-headingOne"
				>
					<div class="accordion-body">
						<div class="accordion" id="">
							<!--"No tasks have been completed."-->
							{#each filteredUpdated as task, i}
								<div class="accordion-item">
									<h2 class="accordion-header" id="">
										<button
											class="btn accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#loaded-${task}-${i}`}
											aria-expanded="false"
											aria-controls={`loaded-${task}-${i}`}
											>{task.fileName} ({task.type === 'store succeeded'
												? 'succeeded'
												: 'failed'})</button
										>
									</h2>
									<div
										id={`loaded-${task}-${i}`}
										class="accordion-collapse collapse show"
										aria-labelledby="panelsStayOpen-headingOne"
									>
										<div class="accordion-body">
											<div class="detail-body">
												<span
													>{new Date(task.date).toLocaleString().replace(/:[0-9][0-9]$/, '')}
												</span>
												<span>{task.count} items</span>

												<DmdTaskActions
													{task}
													stage="load"
													status={task.type === 'store succeeded' ? 'succeeded' : 'failed'}
													on:delete={async () => {
														await handleDeletePressed(filteredUpdated, task);
													}}
												/>
											</div>

											<pre>{task.message}</pre>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

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
	.detail-body {
		display: flex;
		justify-content: space-between;
	}
</style>
