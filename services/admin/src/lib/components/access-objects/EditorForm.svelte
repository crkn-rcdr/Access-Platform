<!--
@component
### Overview
This component displays the non content properties for an access editorObject and allows users to edit them.

### Properties
|    |    |    |
| -- | -- | -- |
| editorObject: PagedAccessObject | required | The PagedAccessObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model. |

### Usage
```  
<InfoEditor bind:editorObject />
```
*Note: `bind:` is required for changes to the editorObject to be reflected in higher level components.*
-->
<script lang="ts">
	import TiWarning from 'svelte-icons/ti/TiWarning.svelte';
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import type { Membership, Noid, PagedAccessObject } from '@crkn-rcdr/access-data';
	import { typedChecks } from '$lib/utils/validation';
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';
	import EditorInput from '$lib/components/access-objects/EditorInput.svelte';
	import { createEventDispatcher } from 'svelte';
	import { showConfirmation } from '$lib/utils/confirmation';
	import SlugSearch from './SlugSearch.svelte';
	//import { editorObjectStore } from "$lib/stores/accessObjectEditorStore";
	import { onDestroy, onMount } from 'svelte';
	import timer from '$lib/stores/timer';

	/**
	 * @type {PagedAccessObject} The editorObject that will be manipulated by the user, usually, a copy of an access object that acts as a form model.
	 */
	export let editorObject: PagedAccessObject; // Not sure if we should pass an editorObject or have a list of props (ex: slug, label, ...) that can be null, and show ones that are instantiated only?

	/**
	 * @type {"create" | "edit"} An indicator variable if the editor is in create mode or edit mode.
	 */
	export let mode: 'create' | 'edit';

	/**
	 * Membership record for this object.
	 */
	export let membership: Membership;

	/**
	 * The status of the process that moves the data into the access platform databases
	 */
	export let cacheStatus: { found: true; result: any } | { found: false };

	/**
	 * The session store that contains the module for sending requests to lapin.
	 */
	const session = getStores<Session>().session;

	/**
	 * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
	 */
	const dispatch = createEventDispatcher();

	let isSlugValid = true;

	let unsubscribe;

	const interval = timer({ interval: 15000 }); // 2x per min

	function handleSavePressed(event: any) {
		dispatch('save', event.detail);
	}

	const removeMembership = async (collectionID: Noid) => {
		return await showConfirmation(
			async () => {
				try {
					await $session.lapin.mutation('collection.removeMembers', {
						user: $session.user,
						id: collectionID,
						members: [editorObject.id]
					});

					membership = membership.filter((record) => record.id !== collectionID);
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
			'Success! Changes saved.',
			'Error: failed to save changes.'
		);
	};

	$: {
		editorObject;
		dispatch('change', editorObject);
	}

	onMount(() => {
		if (cacheStatus) {
			unsubscribe = interval.subscribe(async () => {
				cacheStatus = await $session.lapin.query('accessObject.getCacheStatus', editorObject.id);
			});
		}
	});
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

{#if editorObject}
	<div class="info-wrap auto-align">
		<div class="info-form">
			<label for="slug">Slug</label>
			{#if mode === 'edit'}
				<EditorInput
					keys={['slug']}
					bind:value={editorObject['slug']}
					on:save={handleSavePressed}
					saveDisabled={!isSlugValid}
				>
					<div>
						<SlugSearch
							searchOnLoad={false}
							bind:slug={editorObject['slug']}
							on:slugValidity={(e) => {
								isSlugValid = e.detail;
							}}
						/>
					</div>
				</EditorInput>
			{:else}
				<SlugSearch
					searchOnLoad={false}
					bind:slug={editorObject['slug']}
					on:slugValidity={(e) => {
						isSlugValid = e.detail;
					}}
				/>
			{/if}

			<br /><br />

			<label for="label">Label</label>
			<br />
			<NotificationBar
				message={typedChecks[editorObject['type']].getLabelValidationMsg(editorObject['label'])}
				status="fail"
			/>

			{#if mode === 'edit'}
				<EditorInput
					keys={['label', 'none']}
					bind:value={editorObject['label']['none']}
					on:save={handleSavePressed}
					saveDisabled={!editorObject['label']['none'] ||
						editorObject['label']['none'].length === 0}
				>
					<textarea
						id="label"
						name="label"
						rows="6"
						bind:value={editorObject['label']['none']}
						on:keyup={() => {
							// Triggers validation msg
							if (editorObject?.['label']?.['none']?.length === 0)
								editorObject['label']['none'] = undefined;
						}}
					/>
				</EditorInput>
			{:else}
				<textarea
					id="label"
					name="label"
					bind:value={editorObject['label']['none']}
					on:keyup={() => {
						// Triggers validation msg
						if (editorObject?.['label']?.['none']?.length === 0)
							editorObject['label']['none'] = undefined;
					}}
				/>
			{/if}
			<br /><br />

			{#if editorObject.type === 'collection'}
				<label for="behavior">Behaviour</label><br />
				<select id="behavior" name="behavior" bind:value={editorObject['behavior']}>
					<option>multi-part</option>
					<option>unordered</option>
				</select><br /><br />
			{/if}

			<table>
				<thead>
					<th colspan={4}>Membership</th>
				</thead>
				<tbody>
					{#if membership?.length > 0}
						{#each membership as coll}
							<tr>
								<td colspan={3}>
									<a
										target="_blank"
										href="/object/edit/{coll.id}"
										class="auto-align auto-align__a-center"
									>
										{#if coll.label['none']}
											{coll.slug}: {coll.label['none']}
										{:else}
											{coll.slug}
											<span
												class="icon not-success"
												data-tooltip={`Warning! This collection does not have a label. Click here to open it in the editor and set a label.`}
											>
												<TiWarning />
											</span>
										{/if}
									</a>
								</td>
								<td class="remove-button">
									<button class="sm danger" on:click={() => removeMembership(coll.id)}
										>Remove</button
									>
								</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan={4}>This {editorObject.type} is not a member of any collections.</td>
						</tr>
					{/if}
				</tbody>
			</table>

			<!--Fixtures don't have this yet, causes save to be enabled on load-->
			<!--span>
      <span>
        <label for="viewing-direction">Viewing Direction</label>
        <select
          id="viewing-direction"
          name="viewing-direction"
          bind:value={manifest["viewingDirection"]}
        >
          <option>left-to-right</option>
          <option>right-to-left</option>
          <option>top-to-bottom</option>
          <option>bottom-to-top</option>
        </select>
      </span><br /-->
		</div>
		<div class="cache-status">
			{#if cacheStatus?.found && cacheStatus.result}
				{#if !('succeeded' in cacheStatus.result)}
					<table>
						<tbody>
							<tr>
								<td>Published On:</td>
								<td>
									{#if editorObject['public']}
										{typeof editorObject['public'] === 'string'
											? editorObject['public']
											: new Date(parseInt(`${editorObject['public']}`) * 1000).toLocaleString()}
									{:else}
										Not published
									{/if}
								</td>
							</tr>
							<tr>
								<td>Access Status:</td>
								<td>Currently updating...</td>
							</tr>
							<tr>
								<td>Update Started:</td>
								<td>{cacheStatus.result.requestDate}</td>
							</tr>
						</tbody>
					</table>
				{:else if cacheStatus.result.succeeded}
					<table>
						<tbody>
							<tr>
								<td>Published On:</td>
								<td>
									{#if editorObject['public']}
										{typeof editorObject['public'] === 'string'
											? editorObject['public']
											: new Date(parseInt(`${editorObject['public']}`) * 1000).toLocaleString()}
									{:else}
										Not published
									{/if}
								</td>
							</tr>
							<tr>
								<td>Access Status:</td>
								<td>Most recent update succeeded!</td>
							</tr>
							<tr>
								<td>Update Started:</td>
								<td>{cacheStatus.result.requestDate}</td>
							</tr>
							<tr>
								<td>Update Finished:</td>
								<td>{cacheStatus.result.processDate}</td>
							</tr>
						</tbody>
					</table>
					<br />
					<NotificationBar status="warn" message={cacheStatus.result.message} />
				{:else}
					<table>
						<tbody>
							<tr>
								<td>Published On:</td>
								<td>
									{#if editorObject['public']}
										{typeof editorObject['public'] === 'string'
											? editorObject['public']
											: new Date(parseInt(`${editorObject['public']}`) * 1000).toLocaleString()}
									{:else}
										Not published
									{/if}
								</td>
							</tr>
							<tr>
								<td>Access Status:</td>
								<td>Most recent update failed.</td>
							</tr>
							<tr>
								<td>Update Started:</td>
								<td>{cacheStatus.result.requestDate}</td>
							</tr>
							<tr>
								<td>Update Finished:</td>
								<td>{cacheStatus.result.processDate}</td>
							</tr>
						</tbody>
					</table>
					<br />
					<NotificationBar status="fail" message={cacheStatus.result.message} />
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.info-wrap {
		width: 100%;
	}
	.info-form {
		padding: 1.5rem;
		flex: 8;
		margin-right: 1rem;
	}
	.cache-status {
		margin-right: 1rem;
		padding: 0.5rem 0;
		color: var(--secondary);
	}
	.cache-status tbody {
		background: none !important;
	}
	label,
	textarea {
		width: 100%;
	}
	.not-success.icon {
		color: var(--danger);
		margin-left: 1rem;
	}
	.remove-button {
		text-align: right;
	}
</style>
