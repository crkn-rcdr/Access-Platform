<!--
@component
### Overview
The editor actions component holds functionality that is responsible for performing actions like saving, deleting, and publishing AccessObjects.

### Properties
|    |    |    |
| -- | -- | -- |
| serverObject: AccessObject        | required | This is the 'original' serverObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed  |
| editorObject: AccessObject   | required | This is a deep copy of the original serverObject, it gets edited as the user makes changes in the editor. It's purpose is to contain the form state for the editors. |

### Usage
```  
<EditorActions bind:serverObject bind:editorObject />
```
*Note: `bind:` is required for changes to the serverObject and its model to be reflected in higher level components.*
-->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Session } from '$lib/types';
	import type { PagedAccessObject } from '@crkn-rcdr/access-data';
	import type { NewCollection, NewManifest } from '@crkn-rcdr/access-data';
	import { getStores } from '$app/stores';
	import { showConfirmation } from '$lib/utils/confirmation';
	import { checkValidDiff } from '$lib/utils/validation';
	import Modal from '$lib/components/shared/Modal.svelte';
	import { goto } from '$app/navigation';
	import Loading from '../shared/Loading.svelte';
	import LoadingButton from '../shared/LoadingButton.svelte';

	/**
	 * This is th$lib/utils/confirmationerObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed.
	 */
	export let serverObject: PagedAccessObject;
	/**
	 * The AccessObject editorObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model.
	 */
	export let editorObject: PagedAccessObject;
	/**
	 * @type {"create" | "edit"} An indicator variable if the editor is in create mode or edit mode.
	 */
	export let mode: 'create' | 'edit';

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/**
	 * @type {any} A module that quickly deep copies (clones) an serverObject.
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
	 * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
	 */
	const dispatch = createEventDispatcher();

	/**
	 * Sets @var isSaveEnabled depending on if the editorObject is valid.
	 * @returns void
	 */
	function checkEnableSave() {
		isSaveEnabled = checkValidDiff(serverObject, editorObject);
	}

	$: {
		editorObject;
		checkEnableSave();
	}

	$: {
		mode = serverObject?.id ? 'edit' : 'create';
	}

	async function handleSaveCreate() {
		await showConfirmation(
			async () => {
				try {
					if (editorObject.type === 'manifest') {
						const data: NewManifest = {
							slug: editorObject.slug,
							summary: editorObject.summary,
							behavior: editorObject.behavior,
							canvases: [], //editorObject.canvases || [],
							viewingDirection: editorObject.viewingDirection,
							type: editorObject.type,
							label: editorObject.label
						};
						const response = await $session.lapin.mutation(`manifest.new`, {
							user: $session.user,
							data
						});
						goto(`/object/edit/${response}`);
						return {
							success: true,
							details: response
						};
					} else if (editorObject.type === 'collection') {
						const data: NewCollection = {
							slug: editorObject.slug,
							summary: editorObject.summary,
							type: editorObject.type,
							label: editorObject.label,
							behavior: editorObject.behavior,
							members: []
						};
						const response = await $session.lapin.mutation(`collection.new`, {
							user: $session.user,
							data
						});
						goto(`/object/edit/${response}`);
						return {
							success: true,
							details: response
						};
					} else
						return {
							success: false,
							details: 'Object not of type collection or manifest'
						};
				} catch (e) {
					return {
						success: false,
						details: e.message
					};
				}
			},
			'Success! Changes saved.',
			'Error: failed to save changes.'
		);
	}

	/**
	 * @event onMount
	 * @description When the component instance is mounted onto the dom, the 'clone' variable is set to the rfdc module.
	 */
	onMount(async () => {
		clone = (await import('rfdc')).default();
	});
</script>

<span class="editor-actions auto-align auto-align__a-center">
	{#if mode === 'create'}
		<button class="save" disabled={!isSaveEnabled} on:click={handleSaveCreate}>Create</button>
	{/if}
</span>

<style>
	:global(.editor-actions button) {
		margin-left: var(--margin-sm);
	}
	/* .centered-modal-content, */
	.modal-loader-wrap {
		height: 5rem;
	}
	.reassurance {
		font-size: 1rem;
		min-width: 16rem;
		color: var(--secondary);
	}
</style>
