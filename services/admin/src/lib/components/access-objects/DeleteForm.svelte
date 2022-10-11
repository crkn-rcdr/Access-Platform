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
	import { onMount } from 'svelte';
	import type { Session } from '$lib/types';
	import type { PagedAccessObject } from '@crkn-rcdr/access-data';
	import { getStores } from '$app/stores';
	import { showConfirmation } from '$lib/utils/confirmation';
	import { goto } from '$app/navigation';
	import Loading from '../shared/Loading.svelte';

	/**
	 * This is th$lib/utils/confirmationerObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed.
	 */
	export let editorObject: PagedAccessObject;

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/**
	 * @type {any} A module that quickly deep copies (clones) an editorObject.
	 */
	let clone: any;

	/**
	 * @type {boolean} Controls if the save button is displayed or not.
	 */
	let isSaveEnabled = false;

	/**
	 * @type {boolean} Controls if the move to storage modal is being displayed or not.
	 */
	let showDeleteModal = false;

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

	let isDeleting = false;

	/**
	 * Sends the request to the backend to delete the access editorObject.
	 * @returns response
	 */
	async function handleDelete() {
		showDeleteModal = false;
		isDeleting = true;
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
						isDeleting = false;
						return { success: true, details: '' };
					} catch (e) {
						console.log(e);
						isDeleting = false;
						return { success: false, details: e.message };
					}
				}
				isDeleting = false;
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
		if (
			!editorObject.updateInternalmeta ||
			(editorObject.updateInternalmeta && 'succeeded' in editorObject.updateInternalmeta)
		) {
			console.log('one');
			if (editorObject.updateInternalmeta && editorObject.updateInternalmeta['succeeded']) {
				console.log('two');
				isDeleteModalWaiting = false;
				setDeletionModalTextEnabled();
			} else if (!editorObject.updateInternalmeta) {
				console.log('two');
				isDeleteModalWaiting = false;
				setDeletionModalTextEnabled();
			} else {
				console.log('three');
				isDeleteModalWaiting = false;
				setDeletionModalTextError();
			}
		} else {
			console.log('four');
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
							console.log('More tries left');
							requestLoop(i);
						} else {
							isDeleteModalWaiting = false;
							setDeletionModalTextTryAgain();
						}
					}
				}, 30000);
			})(30);
		}

		showDeleteModal = true;
	}

	/**
	 * @event onMount
	 * @description When the component instance is mounted onto the dom, the 'clone' variable is set to the rfdc module.
	 */
	onMount(async () => {
		clone = (await import('rfdc')).default();
		await openDeletionModal();
	});
</script>

<div class="delete-wrap">
	<b>{deleteModalTitle}</b>
	<br />
	<br />
	{#if isDeleteModalWaiting}
		{deleteModalMsg}
		<br />
		<br />
		<div class="modal-loader-wrap">
			<Loading backgroundType="gradient" />
		</div>
	{:else}
		<p>{deleteModalMsg}</p>
	{/if}
	<br />
	<div>
		{#if !isDeleteModalWaiting}
			{#if deleteModalActionText === 'Ok'}
				<button
					class="primary"
					on:click={() => {
						showDeleteModal = false;
					}}
				>
					{deleteModalActionText}
				</button>
			{:else}
				<button class="danger" on:click={handleDelete}>
					{deleteModalActionText}
				</button>
			{/if}
		{/if}
	</div>
</div>

<style>
	.delete-wrap {
		padding: 1.5rem;
	}
	/* .centered-modal-content, */
	.modal-loader-wrap {
		height: 5rem;
	}
</style>
