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
	 * The status of the process that  creates a pdf for the manifest with ocr data
	 */
	export let ocrStatus: { found: true; result: any } | { found: false };

	/**
	 * The session store that contains the module for sending requests to lapin.
	 */
	const session = getStores<Session>().session;

	/**
	 * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
	 */
	const dispatch = createEventDispatcher();

	let isSlugValid = true;

	let status: 'published' | 'unpublished' | null;

	let unsubscribe;

	const interval = timer({ interval: 15000 }); // 2x per min

	function handleSavePressed(event: any) {
		dispatch('save', event.detail);
	}

	async function handlePublishStatusChange() {
		return await showConfirmation(
			async () => {
				if (
					editorObject.type === 'manifest' ||
					editorObject.type === 'pdf' ||
					editorObject.type === 'collection'
				) {
					try {
						if (status === 'unpublished') {
							const response = await $session.lapin.mutation(`accessObject.unpublish`, {
								id: editorObject.id,
								user: $session.user
							});
							//editorObject.public = null;
						} else {
							const response = await $session.lapin.mutation(`accessObject.publish`, {
								id: editorObject.id,
								user: $session.user
							});
							//editorObject.public = new Date().toISOString().replace(/.\d+Z$/g, 'Z');
						}
						dispatch('change', editorObject);
						return {
							success: true,
							details: JSON.stringify(editorObject)
						};
					} catch (e) {
						console.log(e);
						return { success: false, details: e.message };
					}
				}
				return {
					success: false,
					details: 'Object not of type collection, pdf, or manifest'
				};
			},
			`Success! Updated the status of the ${editorObject['type']}.`,
			`Error: could not update the status of the ${editorObject['type']}.`
		);
	}

	async function handleForceUpdate() {
		return await showConfirmation(
			async () => {
				if (
					editorObject.type === 'manifest' ||
					editorObject.type === 'pdf' ||
					editorObject.type === 'collection'
				) {
					try {
						const response = await $session.lapin.mutation(
							`accessObject.forceUpdate`,
							editorObject.id
						);

						cacheStatus = await $session.lapin.query(
							'accessObject.getCacheStatus',
							editorObject.id
						);

						dispatch('change', editorObject);
						return {
							success: true,
							details: JSON.stringify(editorObject)
						};
					} catch (e) {
						console.log(e);
						return { success: false, details: e.message };
					}
				}
				return {
					success: false,
					details: 'Object not of type collection, pdf, or manifest'
				};
			},
			`Success! Started data transfer for ${editorObject['type']}.`,
			`Error: could not data transfer for ${editorObject['type']}.`
		);
	}

	async function handleCreateOCRPDF() {
		return await showConfirmation(
			async () => {
				if (editorObject.type === 'manifest') {
					try {
						const response = await $session.lapin.mutation(`manifest.singleCreateOCRPDF`, {
							id: editorObject.id,
							user: $session.user
						});

						ocrStatus = await $session.lapin.query('manifest.getOCRStatus', editorObject.id);

						dispatch('change', editorObject);
						return {
							success: true,
							details: JSON.stringify(editorObject)
						};
					} catch (e) {
						console.log(e);
						return { success: false, details: e.message };
					}
				}
				return {
					success: false,
					details: 'Object not of type collection, pdf, or manifest'
				};
			},
			`Success! Started data transfer for ${editorObject['type']}.`,
			`Error: could not data transfer for ${editorObject['type']}.`
		);
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

	onMount(async () => {
		if (editorObject.id) {
			cacheStatus = await $session.lapin.query('accessObject.getCacheStatus', editorObject.id);
			ocrStatus = await $session.lapin.query('manifest.getOCRStatus', editorObject.id);

			status = editorObject.public ? 'published' : 'unpublished';

			unsubscribe = interval.subscribe(async () => {
				cacheStatus = await $session.lapin.query('accessObject.getCacheStatus', editorObject.id);
				ocrStatus = await $session.lapin.query('manifest.getOCRStatus', editorObject.id);
				ocrStatus;
				console.log('pulled');
				dispatch('pullServer', editorObject);
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
			<label for="status">Metadata File Type</label><br />
			{#if editorObject['dmdType']}
				<span class="public">
					{editorObject['dmdType']}
				</span>
			{:else}
				<span class="public"> None </span>
			{/if}
			<br /><br />
			{#if mode === 'edit' && status}
				<label for="status">Status</label><br />

				{#if !editorObject['dmdType']}
					<span class="public">
						Publishing is disabled for {editorObject['type']}s with no metadata. Please use the
						<a href="/dmd">"Load Metadata"</a>
						tool to add metadata to your {editorObject['type']}.
					</span>
					<br />
				{:else}
					<EditorInput
						saveDisabled={!editorObject['public'] && !editorObject['dmdType']}
						keys={['status']}
						bind:value={status}
						on:save={handlePublishStatusChange}
					>
						<div>
							<select id="behavior" name="behavior" bind:value={status}>
								<option>unpublished</option>
								<option>published</option>
							</select>
						</div>
					</EditorInput>
					{#if editorObject.public}
						<span class="public">{editorObject.public}</span>
					{/if}
				{/if}

				<br /><br />
			{/if}

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

				{#if mode === 'edit'}
					<EditorInput
						keys={['behavior']}
						bind:value={editorObject['behavior']}
						on:save={handleSavePressed}
					>
						<div>
							<select id="behavior" name="behavior" bind:value={editorObject['behavior']}>
								<option>multi-part</option>
								<option>unordered</option>
							</select>
						</div>
					</EditorInput>
				{:else}
					<select id="behavior" name="behavior" bind:value={editorObject['behavior']}>
						<option>multi-part</option>
						<option>unordered</option>
					</select>
				{/if}
				<br /><br />
			{/if}

			<table class="table">
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
									<button class="btn btn-sm danger" on:click={() => removeMembership(coll.id)}
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
		</div>
		<div class="cache-status">
			{#if cacheStatus?.found && cacheStatus.result}
				{#if !('succeeded' in cacheStatus.result)}
					<div class="cache-title">Data Transfer (Admin Tools -> CAP)</div>
					<table class="table">
						<tbody>
							<tr>
								<td>Status:</td>
								<td>Currently updating...</td>
							</tr>
							<tr>
								<td>Started:</td>
								<td>{cacheStatus.result.requestDate}</td>
							</tr>
						</tbody>
					</table>
					<br />
					<button class="btn" disabled>Force data transfer to CAP</button>
				{:else if cacheStatus.result.succeeded}
					<div class="cache-title">Data Transfer (Admin Tools -> CAP)</div>
					<table class="table">
						<tbody>
							<tr>
								<td>Status:</td>
								<td>Most recent update succeeded!</td>
							</tr>
							<tr>
								<td>Started:</td>
								<td>{cacheStatus.result.requestDate}</td>
							</tr>
							<tr>
								<td>Finished:</td>
								<td>{cacheStatus.result.processDate}</td>
							</tr>
						</tbody>
					</table>
					<br />
					<NotificationBar status="warn" message={cacheStatus.result.message} />
					{#if editorObject.public}
						<button class="btn secondary" on:click={handleForceUpdate}>
							Force data transfer to CAP
						</button>
					{/if}
				{:else}
					<div class="cache-title">Data Transfer (Admin Tools -> CAP)</div>
					<table class="table">
						<tbody>
							<!--tr>
                <Used to show publish date here>
							</tr-->
							<tr>
								<td>Status:</td>
								<td>Most recent update failed.</td>
							</tr>
							<tr>
								<td>Started:</td>
								<td>{cacheStatus.result.requestDate}</td>
							</tr>
							<tr>
								<td>Finished:</td>
								<td>{cacheStatus.result.processDate}</td>
							</tr>
						</tbody>
					</table>
					<br />
					<NotificationBar status="fail" message={cacheStatus.result.message} />
					{#if editorObject.public}
						<button class="btn secondary" on:click={handleForceUpdate}>
							Force data transfer to CAP
						</button>
					{/if}
				{/if}
				<br />
				<div class="updates">
					<a href="/object/edit/data-transfer"> Bulk Data Transfer </a>
				</div>
			{/if}

			<div>
				<br />
				<br />
			</div>

			{#if editorObject.type === 'manifest'}
				<div class="cache-title ocr">OCR PDF Creation</div>
			{/if}
			{#if ocrStatus?.found && ocrStatus.result}
				{#if !('succeeded' in ocrStatus.result)}
					<table class="table">
						<tbody>
							<tr>
								<td>Status:</td>
								<td>Currently running...</td>
							</tr>
							<tr>
								<td>Started:</td>
								<td>{ocrStatus.result.requestDate}</td>
							</tr>
						</tbody>
					</table>
					<br />
				{:else if ocrStatus.result.succeeded}
					<table class="table">
						<tbody>
							<tr>
								<td>OCR Status:</td>
								<td>Most recent creation succeeded!</td>
							</tr>
							<tr>
								<td>Started:</td>
								<td>{ocrStatus.result.requestDate}</td>
							</tr>
							<tr>
								<td>Finished:</td>
								<td>{ocrStatus.result.processDate}</td>
							</tr>
						</tbody>
					</table>
					<br />
					<NotificationBar status="warn" message={ocrStatus.result.message} />
				{:else}
					<table class="table">
						<tbody>
							<!--tr>
                <Used to show publish date here>
							</tr-->
							<tr>
								<td>OCR Status:</td>
								<td>Most recent creation failed.</td>
							</tr>
							<tr>
								<td>Started:</td>
								<td>{ocrStatus.result.requestDate}</td>
							</tr>
							<tr>
								<td>Finished:</td>
								<td>{ocrStatus.result.processDate}</td>
							</tr>
						</tbody>
					</table>
					<br />
					<NotificationBar status="fail" message={ocrStatus.result.message} />
				{/if}
			{/if}
			{#if editorObject.type === 'manifest'}
				{#if ocrStatus?.found && ocrStatus.result && !('succeeded' in ocrStatus.result)}
					<button class="btn" disabled>Create OCR PDF</button>
				{:else}
					<button class="btn secondary" on:click={handleCreateOCRPDF}> Create OCR PDF </button>
				{/if}
				<br />
				<div class="updates">
					<a href="/ocr/ocr-pdf"> Bulk Create OCR PDF </a>
				</div>
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
		max-width: 400px;
	}
	.cache-status tbody {
		background: none !important;
	}
	.public {
		color: var(--secondary);
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

	.cache-title {
		color: var(--base-font-color);
		padding: 0 1rem 1rem 1rem;
	}

	.cache-title.ocr {
		padding-top: 5rem !important;
	}

	.cache-status button,
	.updates {
		float: left;
		margin-left: 1rem;
	}
</style>
