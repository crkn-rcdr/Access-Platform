<!--
@component
### Overview
The editor actions component holds functionality that is responsible for performing actions like saving, deleting, and publishing AccessObjects.

### Properties
|    |    |    |
| -- | -- | -- |
| editorObject: AccessObject        | required | This is the 'original' editorObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed  |
| editorObject: AccessObject   | required | This is a deep copy of the original editorObject, it gets edited as the user makes changes in the editor. It's purpose is to contain the form state for the editors. |

### Usage
```  
<EditorActions bind:editorObject bind:editorObject />
```
*Note: `bind:` is required for changes to the editorObject and its model to be reflected in higher level components.*
-->
<script lang="ts">
	import type { Session } from '$lib/types';
	import type { PagedAccessObject } from '@crkn-rcdr/access-data';
	import { editorObjectStore } from '$lib/stores/accessObjectEditorStore';
	import { getStores } from '$app/stores';
	import { showConfirmation } from '$lib/utils/confirmation';
	import { goto } from '$app/navigation';
	import Loading from '../shared/Loading.svelte';
	import { pull } from 'lodash-es';

	/**
	 * This is th$lib/utils/confirmationerObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed.
	 */
	export let editorObject: PagedAccessObject;

	export let cacheStatus: any;

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/**
	 * @type {string} Used to show a message to the user when delete is pressed.
	 */
	let deleteModalTitle = '';

	/**
	 * @type {string} Used to show a message to the user when delete is pressed.
	 */
	let deleteModalMsg = '';

	let deleteModalActionText = '';

	let isDeleteModalWaiting = false;

	/**
	 * Sends the request to the backend to delete the access editorObject.
	 * @returns response
	 */
	async function handleDelete() {
		return await showConfirmation(
			async () => {
				if (
					editorObject.type === 'manifest' ||
					editorObject.type === 'collection' ||
					editorObject.type === 'pdf'
				) {
					try {
						const response = await $session.lapin.mutation(`accessObject.delete`, {
							id: editorObject.id,
							user: $session.user
						});
						//dispatch("updated");
						//await pulleditorObject();
						goto('/object/edit');
						return { success: true, details: '' };
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
			`Success! Deleted '${editorObject['slug']}.'`,
			`Error deleting '${editorObject['slug']}.'`
		);
	}

	/**
	 * This method pulls the 'editorObject' from the backend. This resets the form and ensures that any problems saving changes are caught.
	 * @returns void
	 */
	async function pulleditorObject() {
		await showConfirmation(
			async () => {
				try {
					const response = await $session.lapin.query('accessObject.getPaged', editorObject['id']);
					editorObject = response;
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
			'Error: failed to update page. Please refresh.',
			true
		);
	}

	function setDeletionModalTextEnabled() {
		deleteModalTitle = `Are you sure you want to delete ${editorObject['slug']}?`;
		deleteModalMsg = `By deleting ${editorObject['slug']}, you will be taking it out of all the collections it belongs to. You will be able to use the slug, "${editorObject['slug']}", for future ${editorObject['type']}s. You can add ${editorObject['slug']} back into the access platform by importing it from preservation again.`;
		deleteModalActionText = `Delete`;
	}

	function setDeletionModalTextWaiting() {
		deleteModalTitle = `${editorObject['slug']} can't be deleted yet.`;
		deleteModalMsg = `There are background processes running preventing ${editorObject['slug']} from being deleted. Please wait...`;
		deleteModalActionText = `Ok`;
	}

	function setDeletionModalTextTryAgain() {
		console.log('No tries left');
		deleteModalTitle = `${editorObject['slug']} can not be deleted.`;
		deleteModalMsg = `Can not delete ${editorObject['slug']}. There are background processes running on ${editorObject['slug']}. Please wait and try again later.`;
		deleteModalActionText = `Ok`;
	}

	function setDeletionModalTextError() {
		deleteModalTitle = `${editorObject['slug']} can't be deleted.`;
		deleteModalMsg = `There was a problem when background processes ran on ${editorObject['slug']} that is preventing it from being deleted. Message: ${editorObject['updateInternalmeta']?.['message']}`;
		deleteModalActionText = `Ok`;
	}

	async function openDeletionModal() {
		if (!editorObject.updateInternalmeta) {
			isDeleteModalWaiting = false;
			setDeletionModalTextEnabled();
		} else if (editorObject.updateInternalmeta && 'succeeded' in editorObject.updateInternalmeta) {
			if (editorObject.updateInternalmeta && editorObject.updateInternalmeta['succeeded']) {
				isDeleteModalWaiting = false;
				setDeletionModalTextEnabled();
			} else {
				isDeleteModalWaiting = false;
				setDeletionModalTextError();
			}
		} else {
			isDeleteModalWaiting = true;
			setDeletionModalTextWaiting();

			(function requestLoop(i) {
				setTimeout(async () => {
					isDeleteModalWaiting = true;
					await pulleditorObject();
					if (editorObject.updateInternalmeta && 'succeeded' in editorObject.updateInternalmeta) {
						if (editorObject.updateInternalmeta?.['succeeded']) {
							isDeleteModalWaiting = false;
							setDeletionModalTextEnabled();
						} else {
							isDeleteModalWaiting = false;
							setDeletionModalTextError();
						}
					} else {
						//isDeleteModalWaiting = true;
						//setDeletionModalTextWaiting();
						if (--i) {
							requestLoop(i);
						} else {
							isDeleteModalWaiting = false;
							setDeletionModalTextTryAgain();
						}
					}
				}, 30000);
			})(30);
		}
	}

	editorObjectStore.subscribe((value: PagedAccessObject) => {
		editorObject = value;
		console.log('Changed', editorObject);
		openDeletionModal().then(() => {
			console.log('redrew1');
		});
	});
</script>

{#if !editorObject.public}
	{#if !cacheStatus || cacheStatus?.processDate}
		<div class="delete-wrap">
			<b>{deleteModalTitle}</b>
			<br />
			<br />
			{#if isDeleteModalWaiting}
				{deleteModalMsg}
				<br />
			{:else}
				<p>{deleteModalMsg}</p>
			{/if}
			<br />
			<div>
				{#if !isDeleteModalWaiting}
					{#if deleteModalActionText !== 'Ok'}
						<button class="btn danger" on:click={handleDelete}>
							{deleteModalActionText}
						</button>
					{/if}
				{/if}
			</div>
		</div>
	{:else}
		<div class="delete-wrap">
			<p>Please wait - {editorObject['slug']} has background processes running on it.</p>
		</div>
	{/if}
{:else}
	<div class="delete-wrap">
		<p>Please unpublish {editorObject['slug']} to enable deletion.</p>
	</div>
{/if}

<style>
	.delete-wrap {
		padding: 1.5rem;
	}
	/* .centered-modal-content, */
	.modal-loader-wrap {
		height: 5rem;
	}
</style>
