<!--
@component
### Overview
The editor component allows for the editing of PagedAccessObjects. It will dynamically render the appropriate screens and options based on the PagedAccessObject type (collection, manifest...)

### Properties
|    |    |    |
| -- | -- | -- |
| serverObject : PagedAccessObject | required | An serverObject of type PagedAccessObject that will be editable in the editor. |

### Usage
```  
<Editor bind:serverObject />
```
*Note: `bind:` is required for changes to the serverObject to be reflected in higher level components.*
-->
<script lang="ts">
	import type { Membership, ObjectListPage, PagedAccessObject } from '@crkn-rcdr/access-data';
	import type { SideMenuPageData } from '$lib/types';
	import Toolbar from '$lib/components/shared/Toolbar.svelte';
	import ManifestContentEditor from '$lib/components/manifests/ManifestContentEditor.svelte';
	import CollectionContentEditor from '$lib/components/collections/CollectionContentEditor.svelte';
	import SideMenuContainer from '$lib/components/shared/SideMenuContainer.svelte';
	import EditorActions from '$lib/components/access-objects/EditorActions.svelte';
	import { getStores } from '$app/stores';
	import type { Session } from '$lib/types';
	import { showConfirmation } from '$lib/utils/confirmation';
	import { editorObjectStore } from '$lib/stores/accessObjectEditorStore';
	import { onDestroy } from 'svelte';
	import EditorForm from '$lib/components/access-objects/EditorForm.svelte';
	import DeleteForm from './DeleteForm.svelte';

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/**
	 * @type {PagedAccessObject} Object being edited.
	 */
	export let serverObject: PagedAccessObject;

	/**
	 * @type {"create" | "edit"} An indicator variable if the editor is in create mode or edit mode.
	 */
	let mode: 'create' | 'edit';

	export let membership: Membership;

	/**
	 * First page of members in the object.
	 */
	export let firstPage: ObjectListPage;

	/**
	 * The number of children in the object.
	 */
	export let childrenCount: number;

	/**
	 * @type {Array<SideMenuPageData>} This list controls the pages that appear in the side menu container, and their contents.
	 */
	let pageList: Array<SideMenuPageData> = [];

	/**
	 * @type {any} A module that deep copies an serverObject
	 */
	let rfdc: any;

	async function saveChange(event: any) {
		return await showConfirmation(
			async () => {
				try {
					if (
						serverObject.type === 'manifest' ||
						serverObject.type === 'collection' ||
						serverObject.type === 'pdf'
					) {
						const bodyObj = {
							id: serverObject.id,
							user: $session.user,
							data: event.detail
						};
						const response = await $session.lapin.mutation(`${serverObject.type}.edit`, bodyObj);
						await pullServerObject();
						return {
							success: true,
							details: JSON.stringify(bodyObj)
						};
					} else
						return {
							success: false,
							details: 'Object not of type collection, manifest, or pdf'
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
	 * Sets the sidemenu container component's pages and menu items based off of the model of the serverObject to be edited's type.
	 * @param serverObject
	 * @returns void
	 */
	async function setPageList() {
		if (!$editorObjectStore) return;

		const generalInfo = {
			name: 'General Info',
			componentData: {
				contentComponent: EditorForm,
				contentComponentProps: {
					mode,
					editorObject: $editorObjectStore,
					membership
				},
				sideMenuPageProps: {},
				listeners: {
					save: (event) => {
						saveChange(event);
					},
					change: (event) => {
						// Unfortunately just passing the store only works for members and canvases lists
						$editorObjectStore = event.detail;
					},
					pullServer: (event) => {
						// Unfortunately just passing the store only works for members and canvases lists
						console.log('pullServer');
						pullServerObject().then(() => {
							console.log('updated');
						});
					}
				}
			}
		};

		pageList = [generalInfo];

		if (mode !== 'create') {
			if (serverObject.type === 'manifest') {
				pageList.push({
					name: 'Manage Content',
					componentData: {
						contentComponent: ManifestContentEditor,
						contentComponentProps: {
							manifest: $editorObjectStore,
							firstPage,
							childrenCount
						},
						sideMenuPageProps: {
							overflowY: 'hidden'
						},
						listeners: {}
					}
				});
			} else if (serverObject.type === 'collection') {
				pageList.push({
					name: 'Manage Members',
					componentData: {
						contentComponent: CollectionContentEditor,
						contentComponentProps: {
							collection: $editorObjectStore,
							firstPage,
							childrenCount
						},
						sideMenuPageProps: {
							overflowY: 'hidden'
						},
						listeners: {}
					}
				});
			}

			if (mode === 'edit') {
				pageList.push({
					name: 'Delete',
					componentData: {
						contentComponent: DeleteForm,
						contentComponentProps: {
							editorObjectStore: editorObjectStore
						},
						sideMenuPageProps: {},
						listeners: {
							change: (event) => {
								// Unfortunately just passing the store only works for members and canvases lists
								$editorObjectStore = event.detail;
							}
						}
					}
				});
			}
		}
	}

	/**
	 * This method pulls the 'serverObject' from the backend. This resets the form and ensures that any problems saving changes are caught.
	 * @returns void
	 */
	async function pullServerObject() {
		await showConfirmation(
			async () => {
				let stage = 0;
				try {
					const response = await $session.lapin.query('accessObject.getPaged', serverObject['id']);
					serverObject = response;
					stage = 1;
					if (serverObject) $editorObjectStore = serverObject;
					stage = 2;
					return {
						success: true,
						details: ''
					};
				} catch (e) {
					const errorString = `Server Object Error - stage: ${stage}. serverObject: ${JSON.stringify(
						serverObject
					)}`;
					await $session.lapin.mutation('accessObject.printErr', errorString);
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

	/**
	 * Deep copies the serverObject to be edited into the $editorObjectStore variable.
	 * @param serverObject
	 * @returns void
	 */
	async function setDataModel(serverObject: PagedAccessObject) {
		if (!serverObject) return;
		rfdc = (await import('rfdc')).default();
		editorObjectStore.set(rfdc(serverObject) as PagedAccessObject); // todo: get this done with zod
		setPageList();
	}

	/**
	 * @listens serverObject
	 * @description A reactive code block that is executed any time the serverObject to be edited changes. It calls @function setDataModel and @function setPageList, to share any changes that occur in this component with the sub-components in the navigator.
	 */
	$: {
		if (serverObject) {
			setDataModel(serverObject);
		}
	}

	$: {
		mode = serverObject?.id ? 'edit' : 'create';
	}

	onDestroy(() => {
		editorObjectStore.set(null);
	});
</script>

{#if $editorObjectStore}
	<div class="editor">
		<SideMenuContainer bind:pageList>
			<Toolbar
				slot="side-menu-header"
				title={serverObject?.['slug']?.length
					? `<span style="text-transform: capitalize;">${serverObject.type}:</span> ${serverObject['slug']}`
					: `<span style="text-transform: capitalize;">New ${serverObject.type}</span>`}
			>
				<div
					class="end-content auto-align auto-align__full auto-align auto-align__j-end auto-align auto-align__a-end auto-align auto-align__column"
				>
					<!--StatusIndicator bind:serverObject /-->
					<EditorActions
						bind:serverObject
						bind:editorObject={$editorObjectStore}
						{mode}
						on:updated={pullServerObject}
					/>
				</div>
			</Toolbar>
		</SideMenuContainer>
	</div>
{/if}

<style>
	:global(.editor .header) {
		min-height: 6em !important;
	}
</style>
