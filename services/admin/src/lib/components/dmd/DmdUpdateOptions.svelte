<!--
@component
### Overview
This component allows the user to update the dmd tasks items in an access platform and/or in preservation. 
### Properties
|    |    |    |
| -- | -- | -- |
| depositor: Depositor | required | The access platform to look for the items in. |
| dmdTask: ParsedDmdTask | required | The DMDTask being processed. |
### Usage
```
<DmdItemUpdater
  dmdTask={dmdTask}
  bind:depositor
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
	import type { Depositor } from '$lib/types';
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import PrefixSelector from '$lib/components/access-objects/PrefixSelector.svelte';
	import type { DMDTask, ShortTaskType } from '@crkn-rcdr/access-data';
	import Loading from '../shared/Loading.svelte';
	import NotificationBar from '../shared/NotificationBar.svelte';
	import LoadingButton from '../shared/LoadingButton.svelte';
	import ScrollStepper from '../shared/ScrollStepper.svelte';
	import ScrollStepperStep from '../shared/ScrollStepperStep.svelte';
	import DmdItemsTable from './DmdItemsTable.svelte';
	import { onMount } from 'svelte';
	import { showConfirmation } from '$lib/utils/confirmation';
	import DmdCreateCollections from './DmdCreateCollections.svelte';
	import Modal from '../shared/Modal.svelte';

	/**
	 *  @type { DMDTask } The DMDTask being processed.
	 */
	export let dmdTask: DMDTask;
	export let type: ShortTaskType;
	export let totalItems: number = 0;
	export let totalPages: number = 0;

	/**
	 *  @type { Depositor } The access platform to look for the items in.
	 */
	let depositor: Depositor;

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	let disabled: boolean = true;
	let destination: 'access' | 'preservation';
	let settingDestination: boolean = false;
	let lookingUp: boolean = false;
	let settingItemIds: boolean = false;
	let sendingStoreRequest: boolean = false;
	let activeStepIndex = 0;
	let currentPage = 1;
	let numNotFound = 0;
	let notFoundIds: string[] = [];
	let createOption = false;
	let creatingCollections = false;
	let showCreateWarningModal = false;
	let firstStepTitle = 'Select Destination';

	async function handleCreateOption() {
		//send req to back end for setting item.shouldStore.
		//also set createOption for the dmdTask
		try {
			creatingCollections = true;
			const response = await $session.lapin.mutation('dmdTask.createCollections', {
				task: dmdTask.id,
				user: $session.user,
				createOption
			});
			if (response) dmdTask = response;
			console.log('dmdTask', dmdTask);
			activeStepIndex = 3;
			creatingCollections = false;
			showCreateWarningModal = false;
		} catch (e) {
			return {
				success: false,
				details: e?.message
			};
		}
	}

	async function handleUpdatePressed() {
		await showConfirmation(
			async () => {
				try {
					sendingStoreRequest = true;
					const result = await $session.lapin.mutation('dmdTask.store', {
						task: dmdTask.id,
						user: $session.user
					});
					if (result) window.location.reload();
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
			'Error: could not add task to store queue.',
			true
		);
	}

	async function onDestinationChange(event) {
		destination = event.currentTarget.value;
		settingDestination = true;
		dmdTask['destination'] = destination;
		await showConfirmation(
			async () => {
				try {
					await $session.lapin.mutation('dmdTask.setDestination', {
						id: dmdTask.id,
						destination,
						user: $session.user
					});
					settingDestination = false;
					activeStepIndex = 1;
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
			'Error: could not save selection.',
			true
		);
	}

	async function lookupItems() {
		lookingUp = true;

		await showConfirmation(
			async () => {
				try {
					const response = await $session.lapin.mutation(`dmdTask.bulkLookup`, {
						id: dmdTask.id,
						destination,
						prefix: depositor.prefix,
						returnPage: currentPage,
						user: $session.user
					});
					dmdTask['items'] = response.pageData.list;
					dmdTask = dmdTask;
					notFoundIds = response.notFoundIds;
					numNotFound = response.numNotFound;
					if (numNotFound === 0) activeStepIndex = 2;
					lookingUp = false;
					return {
						success: true
					};
				} catch (e) {
					console.log(e);
					lookingUp = false;
					return {
						success: false,
						details: e?.message
					};
				}
			},
			'',
			'Error: failed to lookup items.',
			true
		);
	}

	async function handleDepositorChanged(e) {
		depositor = e.detail;
		if (destination) await lookupItems();
	}

	async function handleRemoveExistingPrefixPressed() {
		lookingUp = true;

		await showConfirmation(
			async () => {
				try {
					await $session.lapin.mutation(`dmdTask.removeExistingPrefix`, {
						id: dmdTask.id,
						returnPage: currentPage,
						user: $session.user
					});
					depositor = {
						prefix: 'none',
						label: 'No Prefix'
					};
					await lookupItems();
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
			'Error: failed to reset prefix.',
			true
		);
	}

	$: {
		firstStepTitle =
			'Select Destination' +
			(destination === 'access'
				? ' (' + 'Access' + ')'
				: destination === 'preservation'
				? ' (OAIS)'
				: '');
	}

	/*onMount(() => {
    if (dmdTask["destination"]) activeStepIndex = 1;
    if (dmdTask["items"]?.length && "found" in dmdTask["items"][0])
      activeStepIndex = 2;
  });*/
</script>

{#if dmdTask}
	{#if dmdTask?.fileName}
		<h5>{dmdTask.fileName}</h5>
	{/if}
	<br />
	<div class="auto-align">
		<br />
		<div style="flex:1; margin-right: 1rem;">
			<ScrollStepper enableAutoScrolling={false} bind:activeStepIndex>
				<ScrollStepperStep title={firstStepTitle}>
					<div slot="icon">1</div>
					<div class="auto-align auto-align__column">
						<span>
							<input
								disabled={settingItemIds}
								checked={destination === 'access'}
								on:change={onDestinationChange}
								type="radio"
								name="amount"
								value="access"
							/>
							Access
						</span>
						<span>
							<input
								disabled={settingItemIds}
								checked={destination === 'preservation'}
								on:change={onDestinationChange}
								type="radio"
								name="amount"
								value="preservation"
							/>
							OAIS Packaging Database
						</span>
						{#if settingDestination}
							<span>
								<Loading size="sm" backgroundType="gradient" />
							</span>
						{/if}
					</div>
				</ScrollStepperStep>
				<ScrollStepperStep title="Lookup Items">
					<div slot="icon">2</div>
					<div class="auto-align auto-align__column">
						<button class="btn secondary" on:click={handleRemoveExistingPrefixPressed}>
							Clear Prefix
						</button>
						<br />
						<PrefixSelector {depositor} on:depositorSelected={handleDepositorChanged} />

						{#if lookingUp}
							<span>
								<Loading size="sm" backgroundType="gradient" />
							</span>
						{/if}
						{#if numNotFound > 0}
							{#if numNotFound === dmdTask['itemsCount']}
								<NotificationBar
									message={`No items were found. Please check your selection.`}
									status="fail"
								/>
							{:else if !lookingUp}
								<NotificationBar
									message={`${numNotFound} items not found.`}
									status="fail"
									expandable={true}
									detail={notFoundIds.map((id) => `${id}<br/>`).join('')}
								/>
								<button class="btn primary" on:click={() => (activeStepIndex = 2)}> Ok </button>
							{/if}
							<br />

							{#if destination === 'access'}
								<span>
									<input
										type="checkbox"
										bind:checked={createOption}
										on:change={() => (activeStepIndex = 2)}
									/>
									<span>Create multi-part collections from the items that were not found</span>
								</span>
							{/if}
						{/if}
					</div>
				</ScrollStepperStep>
				{#if createOption}
					<ScrollStepperStep title="Create Collections">
						<div slot="icon">3</div>
						<div class="auto-align auto-align__column">
							{#if creatingCollections}
								<span>
									<Loading size="sm" backgroundType="gradient" />
								</span>
							{/if}
							<button
								class="btn primary"
								on:click={() => {
									showCreateWarningModal = true;
								}}
							>
								Create
							</button>
						</div>
					</ScrollStepperStep>
				{/if}
				<ScrollStepperStep title="Review Selection">
					<div slot="icon">{createOption ? 4 : 3}</div>
					<div class="auto-align auto-align__column">
						<button class="btn primary" on:click={() => (activeStepIndex = createOption ? 4 : 3)}>
							Looks Good!
						</button>
					</div>
				</ScrollStepperStep>
				<ScrollStepperStep isLastStep={true} title="Store Metadata">
					<div slot="icon">{createOption ? 5 : 4}</div>
					<div class="auto-align auto-align__column">
						<span>
							<LoadingButton
								buttonClass="primary"
								on:clicked={handleUpdatePressed}
								showLoader={sendingStoreRequest}
							>
								<!--{disabled}-->
								<span slot="content"> Store Metadata </span>
							</LoadingButton>
						</span>
					</div>
				</ScrollStepperStep>
			</ScrollStepper>
		</div>

		<div style="flex:3;">
			{#if createOption && activeStepIndex === 2}
				<DmdCreateCollections bind:dmdTask bind:totalItems bind:totalPages bind:currentPage />
			{:else}
				<DmdItemsTable
					bind:dmdTask
					bind:type
					bind:totalItems
					bind:totalPages
					bind:currentPage
					bind:activeStepIndex
					showLookupResults={activeStepIndex > 1 || numNotFound > 0}
					showSelection={activeStepIndex > 1}
				/>
			{/if}
		</div>
	</div>
{/if}

<Modal
	bind:open={showCreateWarningModal}
	title="Do you want to review the collections before continuing?"
	size="sm"
>
	<div slot="body">
		If you continue, new collections will be made with the following ids:
		{#each dmdTask['items'] as item, i}
			{#if item['shouldCreate']}
				{item['id']}{#if i != dmdTask['items'].length - 1},&nbsp;{/if}
			{/if}
		{/each}
	</div>
	<div slot="footer">
		<button class="btn secondary" on:click={handleCreateOption}> No, I want to continue </button>
		<button
			class="btn primary"
			on:click={() => {
				showCreateWarningModal = false;
			}}
		>
			Yes, I want to review
		</button>
	</div>
</Modal>

<style>
	.auto-align {
		width: 100%;
	}
	.auto-align > * {
		/**:not(:first-child)*/
		margin-top: 1rem;
	}
</style>
