<!--
@component
TODO
### Overview
Allows the user to modify the member list for a collection.
### Properties
|    |    |    |
| -- | -- | -- |
| collection : Collection    | required | The collection thats contents should be edited. |
### Usage
```  
<CollectionContentEditor bind:collection />
```
*Note: `bind:` is required for changes to the object to be reflected in higher level components.*
-->
<script lang="ts">
	import TiArrowShuffle from 'svelte-icons/ti/TiArrowShuffle.svelte';
	import { onMount, createEventDispatcher } from 'svelte';
	import type { PagedCollection } from '@crkn-rcdr/access-data/src/access/Collection';
	import AutomaticResizeNumberInput from '$lib/components/shared/AutomaticResizeNumberInput.svelte';
	import TiTrash from 'svelte-icons/ti/TiTrash.svelte';
	import { page as pageStore } from '$app/stores';
	import { session } from '$app/stores';
	import type { ObjectListPage, Timestamp } from '@crkn-rcdr/access-data';
	import { showConfirmation } from '$lib/utils/confirmation';
	import Loading from '$lib/components/shared/Loading.svelte';
	import Paginator from '$lib/components/shared/Paginator.svelte';
	import LoadingButton from '$lib/components/shared/LoadingButton.svelte';
	import DropdownMenu from '$lib/components/shared/DropdownMenu.svelte';
	import Modal from '$lib/components/shared/Modal.svelte';
	import PrefixSlugSearchBox from '../access-objects/PrefixSlugSearchBox.svelte';
	import CollectionMemberListManager from './CollectionMemberListManager.svelte';
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';

	export let collection: PagedCollection;

	/**
	 * First page of members in the object.
	 */
	export let firstPage: ObjectListPage;

	/**
	 * The number of children in the object.
	 */
	export let childrenCount: number;

	let activeMemberIndex: number = 0;
	const dispatch = createEventDispatcher();
	//let documentSlug: any[] = [];
	let members: {
		id?: string;
		label?: Record<string, string>;
		slug?: string;
		public?: Timestamp;
	}[];

	let isMemberListEmpty = false;

	let positions: number[] = [];

	/**
	 * @type {string} A control for what component is displayed in the free space of the content editor.
	 */
	let state = 'view';
	/**
	 * Sets @var state to the newState passed in.
	 * @param newState
	 * @returns void
	 */
	/**
	 * @type {number} Shows the number of pages
	 */
	let page: number = 1;
	let size: number = 100;

	let previousLastItem: string | null = null;

	let loading: boolean = false;
	let bulkLoading: boolean = false;
	let showManyShuffleModal: boolean = false;
	let showSingleShuffleModal: boolean = false;
	let slugsToShuffle: string[];
	let shuffleOption: 'moveBefore' | 'moveAfter' = 'moveBefore';
	let shuffleToSlug: string;
	let shuffleLoading: boolean = false;

	//let list: HTMLElement;
	/**
	 * A helper method to slow down the rate of requests going to the backend. Causes the script to pause for 'ms.'
	 * @param ms
	 */
	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function setPositions() {
		if (!members?.length) return;
		positions = [];
		for (let i = 0; i < members.length; i++) positions.push((page - 1) * size + i + 1);
	}

	function changeView(newState: string) {
		state = newState;
	}

	function setActiveIndex(index: number) {
		if (index >= collection?.members?.count) index = collection.members.count - 1;
		if (index < 0) index = 0;
		activeMemberIndex = index;
		dispatch('membersClicked', { index });
	}

	async function moveMemberOnInputChange(event: any, originalItemIndex: number) {
		if (loading) return;
		loading = true;

		let pagedDestinationIndex = parseInt(event.detail.value) - 1;

		if (pagedDestinationIndex >= 0 && pagedDestinationIndex < childrenCount) {
			const canvasToMove = members[originalItemIndex];

			await sendMoveRequest(canvasToMove, pagedDestinationIndex);

			// Highlight and move to new position
			if (pagedDestinationIndex < members.length) {
				activeMemberIndex = pagedDestinationIndex;
				//jumpTo(activeCanvasIndex);
				setActiveIndex(activeMemberIndex);
			}
		}

		loading = false;
	}

	async function deleteMemberByIndex(event: any, index: number) {
		event.stopPropagation();

		if (index >= 0 && index < members.length) {
			const data = {
				id: collection.id,
				members: [members[index].id],
				user: $session.user
			};

			// Shows a notification on move failure
			await showConfirmation(
				async () => {
					try {
						const response = await $session.lapin.mutation('collection.removeMembers', data);
						return {
							success: true,
							details: ''
						};
					} catch (e) {
						return {
							success: false,
							details: e.message
						};
					}
				},
				'Success: member removed from collection.',
				'Error: failed to remove member.'
			);

			// Shows a notification on page grab failure
			await showConfirmation(
				async () => {
					try {
						// we can just grab the current page again instead, but we need to store the previous page's last item to do so.
						await sendCurrentPageRequest();
						return {
							success: true,
							details: ''
						};
					} catch (e) {
						return {
							success: false,
							details: e.message
						};
					}
				},
				'',
				'Error: failed to update page. Please refresh.',
				true
			);
		}
	}

	async function handlePage(event: { detail: { page: number } }) {
		if (loading) return;
		loading = true;

		await showConfirmation(
			async () => {
				try {
					page = event.detail.page;

					const currUrl = `${window.location}`;
					const newUrl = currUrl.includes('page')
						? currUrl.replace(/\?page\=.*/, `?page=${page}`)
						: `${currUrl}?page=${page}`;
					history.pushState({}, null, newUrl);

					const currPage = await $session.lapin.query('collection.page', {
						id: collection.id,
						page: page,
						limit: size
					});
					if (currPage) members = currPage.list;
					else members = [];
					return {
						success: true,
						details: ''
					};
				} catch (e) {
					return {
						success: false,
						details: e?.message
					};
				}
			},
			'',
			'Error: failed to get page.',
			true
		);
		loading = false;
	}

	async function sendMoveRequest(memberToMove, pagedDestinationIndex) {
		const data = {
			id: collection.id,
			members: [memberToMove.id],
			toIndex: pagedDestinationIndex,
			user: $session.user
		};

		// Shows a notification on move failure
		await showConfirmation(
			async () => {
				try {
					const response = await $session.lapin.mutation('collection.moveMembers', data);
					//await sendCurrentPageRequest();
					return {
						success: true,
						details: ''
					};
				} catch (e) {
					return {
						success: false,
						details: e.message
					};
				}
			},
			'Success: new member position saved.',
			'Error: failed to move member.'
		);

		// Shows a notification on page grab failure
		await showConfirmation(
			async () => {
				try {
					// we can just grab the current page again instead, but we need to store the previous page's last item to do so.
					await sendCurrentPageRequest();
					return {
						success: true,
						details: ''
					};
				} catch (e) {
					return {
						success: false,
						details: e.message
					};
				}
			},
			'',
			'Error: failed to update page. Please refresh.',
			true
		);
	}

	async function sendShuffleRequest() {
		if (shuffleLoading) return;
		shuffleLoading = true;
		const data = {
			id: collection.id,
			members: slugsToShuffle,
			refMember: shuffleToSlug,
			user: $session.user,
			operation: shuffleOption
		};

		// Shows a notification on move failure
		await showConfirmation(
			async () => {
				try {
					const response = await $session.lapin.mutation('collection.moveBySlug', data);
					showSingleShuffleModal = false;
					showManyShuffleModal = false;
					slugsToShuffle = [];
					shuffleToSlug = '';
					shuffleLoading = false;

					await sendCurrentPageRequest();

					return {
						success: true,
						details: ''
					};
				} catch (e) {
					showSingleShuffleModal = false;
					showManyShuffleModal = false;
					slugsToShuffle = [];
					shuffleToSlug = '';
					shuffleLoading = false;
					return {
						success: false,
						details: e.message
					};
				}
			},
			'Success: new member position saved.',
			'Error: failed to move member.'
		);
	}

	/*
  async function handleItemDropped(event: {
    detail: { currentItemIndex: number; destinationItemIndex: number };
  }) {
    if (loading) return;
    loading = true;
    if (
      event.detail.currentItemIndex >= 0 &&
      event.detail.currentItemIndex < members.length
    ) {
      const pagedDestinationIndex =
        (page - 1) * size + event.detail.destinationItemIndex;

      const memberToMove = members[event.detail.currentItemIndex];

      sendMoveRequest(memberToMove, pagedDestinationIndex);

      if (pagedDestinationIndex < members.length) {
        activeMemberIndex = pagedDestinationIndex;
        //jumpTo(activeCanvasIndex);
        setActiveIndex(pagedDestinationIndex);
      }
    } else {
      console.log("invalid index");
    }

    loading = false;
  }*/

	async function sendCurrentPageRequest() {
		//if (loading) return;
		loading = true;
		await showConfirmation(
			async () => {
				try {
					const currPage = await $session.lapin.query('collection.pageAfter', {
						id: collection.id,
						after: previousLastItem,
						limit: size
					});
					if (currPage) members = currPage.list;
					else members = [];
					setActiveIndex(activeMemberIndex);
					loading = false;
					return {
						success: true,
						details: ''
					};
				} catch (e) {
					loading = false;
					return {
						success: false,
						details: e?.message
					};
				}
			},
			'',
			'Error: failed to update page. Please refresh.',
			true
		);
	}

	async function handleUnpublishPressed() {
		bulkLoading = true;
		await showConfirmation(
			async () => {
				try {
					const updated = await $session.lapin.mutation('collection.unpublishAllMembers', {
						id: collection.id,
						user: $session.user
					});
					await sleep(2000);
					await sendCurrentPageRequest();
					bulkLoading = false;

					if (!updated) {
						return {
							success: false,
							details: 'Please contact the platform team for assistance.'
						};
					} else {
						return {
							success: true,
							details: ''
						};
					}
				} catch (e) {
					bulkLoading = false;
					return {
						success: false,
						details: e.message
					};
				}
			},
			'Success: all members are being unpublished. Please wait.',
			'Error: failed to unpublish one or more members.'
		);
	}

	async function handleUpdatePressed() {
		bulkLoading = true;
		await showConfirmation(
			async () => {
				try {
					const updated = await $session.lapin.mutation(
						'collection.updateAllMembers',
						collection.id
					);
					bulkLoading = false;

					return {
						success: true,
						details: ''
					};
				} catch (e) {
					bulkLoading = false;
					return {
						success: false,
						details: e.message
					};
				}
			},
			'Success: queued data transfer for all members. Please wait.',
			'Error: failed to queue data transfer for all members.'
		);
	}

	async function handlePublishPressed() {
		bulkLoading = true;
		await showConfirmation(
			async () => {
				try {
					const updated = await $session.lapin.mutation('collection.publishAllMembers', {
						id: collection.id,
						user: $session.user
					});
					await sleep(2000);
					await sendCurrentPageRequest();
					bulkLoading = false;

					if (!updated) {
						return {
							success: false,
							details: 'Please contact the platform team for assistance.'
						};
					} else {
						return {
							success: true,
							details: ''
						};
					}
				} catch (e) {
					bulkLoading = false;
					return {
						success: false,
						details: e.message
					};
				}
			},
			'Success: all members are being published. Please wait.',
			'Error: failed to publish one or more members.'
		);
	}

	onMount(async () => {
		activeMemberIndex = 0;
		if ($pageStore.url.searchParams.get('page')) {
			page = parseInt($pageStore.url.searchParams.get('page'));
			handlePage({ detail: { page } });
		} else {
			if (firstPage) members = firstPage.list;
			else members = [];
			//getMemberContext(firstPage.list);
		}
	});

	$: {
		if (members && !loading) isMemberListEmpty = members?.length === 0;
		setPositions();
	}
</script>

{#if collection && members}
	<!--CollectionMembersAddition
    isCollectionEmpty={isMemberListEmpty}
    bind:destinationMember={collection}
    on:done={handleAddPressed}
    on:addClicked={() => {
      changeView("add");
      collection = collection;
    }}
  /-->
	<CollectionMemberListManager
		on:operationComplete={sendCurrentPageRequest}
		bind:destinationCollection={collection}
		isCollectionEmpty={isMemberListEmpty}
	/>

	{#if members.length}
		<span class="bulk-wrap">
			<DropdownMenu direction="right">
				<span on:click={handleUpdatePressed}>Force Data Transfer All</span>
				<span slot="dropdown-button">
					<LoadingButton backgroundType="gradient" buttonClass="" showLoader={bulkLoading}>
						<span slot="content"> Bulk Member Operations </span>
					</LoadingButton>
				</span>
				<span on:click={() => (showManyShuffleModal = true)}>Move Many</span>
				<span on:click={handlePublishPressed}> Publish All </span>
				<span on:click={handleUnpublishPressed}> Unpublish All </span>
			</DropdownMenu>
		</span>
	{/if}
	<div class="member-wrap" class:disabled={loading}>
		{#if collection.behavior !== 'unordered'}
			<!--DynamicDragAndDropList
        bind:container={list}
        on:itemDropped={handleItemDropped}
      -->
			<!--{collectionmembers.id}
              -->
			{#each members as collectionMember, i}
				<!--DynamicDragAndDropListItem pos={i + 1}-->
				<div
					class="card"
					class:active={i === activeMemberIndex}
					on:mousedown={() => setActiveIndex(i)}
				>
					<div class="card-body">
						<div
							class="shuffle icon"
							on:click={() => {
								showSingleShuffleModal = true;
								slugsToShuffle = [collectionMember.slug];
							}}
						>
							<!--DropdownMenu direction="right">
                    <span slot="dropdown-button"-->
							<TiArrowShuffle />
							<!--/span>
                    <span>
                      Add before: <input />
                    </span>
                    <span>
                      Add after: <input />
                    </span>
                  </DropdownMenu-->
						</div>
						<div class="actions-wrap">
							<div class="auto-align auto-align__column">
								<div class="action pos">
									{positions[i]}
								</div>
								<div
									class="action pos-input"
									on:click={(e) => {
										e.stopPropagation();
									}}
								>
									<AutomaticResizeNumberInput
										name="position"
										max={childrenCount}
										value={positions[i]}
										on:changed={(e) => {
											moveMemberOnInputChange(e, i);
										}}
									/>
								</div>
							</div>
						</div>
						<div class="auto-align auto-align__column label">
							<a class="member-link" href="/object/edit/{collectionMember.id}" target="_blank">
								{collectionMember.slug} : {collectionMember.label?.none
									? collectionMember.label.none
									: 'No label set'}
							</a>
						</div>
						<div class="actions-wrap">
							<div class="auto-align auto-align__column auto-align__a-end">
								{#if collectionMember.public}
									<div class="published">published</div>
								{:else}
									<div class="unpublished">unpublished</div>
								{/if}
								<div
									class="action icon"
									data-tooltip="Remove from collection"
									data-tooltip-flow="bottom"
									on:click={(e) => deleteMemberByIndex(e, i)}
								>
									<TiTrash />
								</div>
							</div>
						</div>
					</div>
				</div>
				<!--/DynamicDragAndDropListItem-->
			{/each}
			<!--/DynamicDragAndDropList-->
		{:else}
			<div>
				<!--bind:this={list}-->
				{#each members as collectionMember, i}
					<div
						class="card"
						class:active={i === activeMemberIndex}
						on:mousedown={() => setActiveIndex(i)}
					>
						<div class="card-body">
							<div class="auto-align auto-align__column label">
								<a class="member-link" href="/object/edit/{collectionMember.id}" target="_blank">
									{collectionMember.slug} : {collectionMember.label?.none
										? collectionMember.label.none
										: 'No label set'}
								</a>
							</div>
							<div class="actions-wrap">
								<div class="auto-align auto-align__column">
									{#if collectionMember.public}
										<div class="published">published</div>
									{:else}
										<div class="unpublished">unpublished</div>
									{/if}
									<div
										class="action icon delete"
										data-tooltip="Remove from collection"
										data-tooltip-flow="bottom"
										on:click={(e) => deleteMemberByIndex(e, i)}
									>
										<TiTrash />
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<div class="pagination-wrap auto-align auto-align__a-start">
		{#if loading}
			<span class="page-info-loader">
				<Loading size="md" backgroundType="gradient" />
			</span>
		{/if}
		<Paginator
			{page}
			bind:pageSize={size}
			count={childrenCount}
			pageSizeEditable={false}
			on:change={handlePage}
		/>
	</div>
{:else}
	<Loading size="md" backgroundType="gradient" />
{/if}

<Modal bind:open={showSingleShuffleModal} title="Move Member">
	<div slot="body">
		{#if !shuffleLoading}
			Move {slugsToShuffle.toString()}
			<select bind:value={shuffleOption}>
				<option value="moveBefore">move before</option>
				<option value="moveAfter">move after</option>
			</select>
			<input bind:value={shuffleToSlug} placeholder="the member with this slug" />
			<br />
		{:else}
			<div class="modal-loader-wrap">
				<Loading backgroundType="gradient" />
			</div>
		{/if}
	</div>
	<div slot="footer">
		<button
			class="btn secondary"
			disabled={shuffleLoading}
			on:click={() => {
				showSingleShuffleModal = false;
				slugsToShuffle = [];
			}}
		>
			Cancel
		</button>
		<button
			class="btn primary"
			disabled={!slugsToShuffle?.length ||
				!shuffleOption?.length ||
				!shuffleToSlug?.length ||
				shuffleLoading}
			on:click={sendShuffleRequest}
		>
			Move Member
		</button>
	</div>
</Modal>

<Modal bind:open={showManyShuffleModal} title="Move Members" size="md">
	<div slot="body">
		{#if !shuffleLoading}
			Enter slug(s) to move (in desired order):
			<br />
			<PrefixSlugSearchBox
				on:slugs={(event) => {
					slugsToShuffle = event.detail;
				}}
			/>
			<br />
			<select bind:value={shuffleOption}>
				<option value="moveBefore">move before</option>
				<option value="moveAfter">move after</option>
			</select>
			<input bind:value={shuffleToSlug} placeholder="the member with this slug" />
			<br />
		{:else}
			<div class="modal-loader-wrap">
				<Loading backgroundType="gradient" />
			</div>
		{/if}
	</div>
	<div slot="footer">
		<button
			disabled={shuffleLoading}
			class="btn secondary"
			on:click={() => {
				showManyShuffleModal = false;
				slugsToShuffle = [];
			}}
		>
			Cancel
		</button>
		<button
			class="btn primary"
			disabled={!slugsToShuffle?.length ||
				!shuffleOption?.length ||
				!shuffleToSlug?.length ||
				shuffleLoading}
			on:click={sendShuffleRequest}
		>
			Move Members
		</button>
	</div>
</Modal>

<style>
	.action {
		margin-right: var(--margin-sm);
	}
	.action.icon {
		opacity: 0.6;
		cursor: pointer;
	}
	.pos {
		font-weight: 400;
		margin-bottom: 0.56rem;
		margin-left: 0.56rem;
		min-width: 3.03rem;
		padding-top: 0.45em;
	}
	.card {
		margin: 1rem 0;
	}
	.pos-input {
		display: none;
	}
	.card:hover .pos-input {
		display: inherit;
	}
	.card:hover .pos {
		display: none;
	}
	.member-wrap {
		border-radius: 2px;
		width: 100%;
		max-width: 100%;
		max-height: 38rem;
		overflow-x: hidden;
		padding: 0;
	}

	.member-wrap.disabled {
		opacity: 0.5;
		overflow: hidden;
		pointer-events: none;
		user-select: none;
	}

	:global(.member-wrap.disabled > *) {
		overflow: hidden;
		pointer-events: none;
		user-select: none;
	}

	.member {
		padding: 1rem;
		min-height: 13rem;
	}
	/*  min-height: 6rem;
  }

  .member:hover {
    background-color: #eeeeee;
  }*/
	.page-info-loader {
		margin-right: var(--margin-sm);
	}
	.pagination-wrap {
		float: right;
	}
	/*.active {
    background-color: white;
  }*/
	.label {
		flex: 9;
		padding-top: 0.45em;
		padding-right: 1rem;
	}
	.published {
		padding-top: 0.45em;
		color: var(--success);
	}
	.unpublished {
		padding-top: 0.45em;
		color: var(--secondary);
	}
	.delete {
		margin-bottom: 0.5em;
	}
	.member-link {
		padding-right: 1rem;
		white-space: pre-wrap; /* CSS3 */
		white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
		white-space: -pre-wrap; /* Opera 4-6 */
		white-space: -o-pre-wrap; /* Opera 7 */
		word-wrap: break-word; /* Internet Explorer 5.5+ */
	}
	.bulk-wrap {
		float: right;
		padding-right: 1rem;
		margin-bottom: 1rem;
		margin-top: 1.7rem;
	}
	.shuffle {
		margin-top: 0.4rem;
		color: var(--secondary);
		margin-right: var(--margin-sm);
	}

	.card-body {
		display: flex;
	}
</style>
