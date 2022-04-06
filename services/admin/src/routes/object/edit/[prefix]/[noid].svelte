<script context="module" lang="ts">
	/**
	 * @module
	 * @description loads in the object from the backend using the params in the route of the page
	 */
	import type { Load } from '@sveltejs/kit';
	import type { RootLoadOutput } from '$lib/types';
	export const load: Load<RootLoadOutput> = async ({ params, stuff }) => {
		try {
			if (params['prefix'] && params['noid']) {
				const id = [params['prefix'] as string, params['noid'] as string].join('/');
				const serverObject: PagedAccessObject = await stuff.lapin.query(
					'accessObject.getPaged',
					id
				);

				const membership = await stuff.lapin.query('accessObject.getMembership', id);

				const cacheStatus = await stuff.lapin.query('accessObject.getCacheStatus', id);

				let firstPage: ObjectListPage;
				let childrenCount;

				if (serverObject['members']) {
					firstPage = await stuff.lapin.query('collection.pageAfter', {
						id: serverObject.id,
						after: null,
						limit: 100
					});
					childrenCount = serverObject['members'].count;
				} else if (serverObject['canvases']) {
					firstPage = await stuff.lapin.query('manifest.pageAfter', {
						id: serverObject.id,
						after: null,
						limit: 100
					});
					childrenCount = serverObject['canvases'].count;
				}

				return {
					props: {
						serverObject,
						membership,
						id,
						childrenCount,
						firstPage,
						cacheStatus,
						error: ''
					}
				};
			}
			return { props: { error: 'Could not find prefix or noid in url.' } };
		} catch (e) {
			return {
				props: {
					error:
						'Could not get item from the server. Please contact the platform team for assistance.'
				}
			};
		}
	};
</script>

<script lang="ts">
	/**
	 * @file
	 * @description This page shows the editor for the object.
	 * The object is given to the page from the module above.
	 */
	import type { ObjectListPage, PagedAccessObject } from '@crkn-rcdr/access-data';
	import type { Membership, Noid } from '@crkn-rcdr/access-data';
	import Editor from '$lib/components/access-objects/Editor.svelte';
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';
	import Loading from '$lib/components/shared/Loading.svelte';

	export let id: Noid;

	/**
	 * @type {PagedAccessObject} Object being edited.
	 */
	export let serverObject: PagedAccessObject;

	/**
	 * Membership record for this object.
	 */
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
	 * @type {string} An error message insdicating what went wrong.
	 */
	export let error: string;

	/**
	 * @type {{ found: true; result: any } | { found: false }} The status of the process that moves the data into the access platform databases
	 */
	export let cacheStatus: { found: true; result: any } | { found: false };
</script>

{#key id}
	{#if serverObject}
		<Editor bind:serverObject {membership} {firstPage} {childrenCount} {cacheStatus} />
	{:else if error}
		<br />
		<div class="wrapper">
			<NotificationBar status="fail" message={error} />
		</div>
	{:else}
		<div class="wrapper center">
			<Loading backgroundType="gradient" /><br />
			Loading...
		</div>
	{/if}
{/key}
