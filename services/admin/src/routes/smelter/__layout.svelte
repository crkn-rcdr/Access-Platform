<script context="module" lang="ts">
	/**
	 * @module
	 * @description loads in the dmdtask from the backend using the params in the route of the page
	 */
	import type { Load } from '@sveltejs/kit';
	import type { RootLoadOutput } from '$lib/types';
	export const load: Load<RootLoadOutput> = async ({ url, params }) => {
		try {
			if (url.pathname.includes('/slug')) return { props: { activePageIndex: -1 } };
			else if (url.pathname === '/smelter') return { props: { activePageIndex: 0 } };
			else if (url.pathname.includes('find')) return { props: { activePageIndex: 0 } };
			else if (url.pathname.includes('queue')) return { props: { activePageIndex: 1 } };
			else if (url.pathname.includes('status')) return { props: { activePageIndex: 2 } };
			else if (url.pathname.includes('neversmelted')) return { props: { activePageIndex: 3 } };
			else if (url.pathname.includes('updated')) return { props: { activePageIndex: 4 } };
		} catch (e) {
			return {
				props: {
					error: 'Could not load the import tool. Please contact the platform team for assistance.'
				}
			};
		}
	};
</script>

<script lang="ts">
	import NotificationBar from '$lib/components/shared/NotificationBar.svelte';
	import Dipstaging from '$lib/components/dipstaging/Dipstaging.svelte';
	/**
	 * @template
	 * @description This is the common layout for the dmd task updater pages
	 */
	export let activePageIndex: number;
	export let error: string;
</script>

{#if error}
	<NotificationBar status="fail" message={error} />
{/if}

{#if activePageIndex === -1}
	<!-- For the slug based import search -->
	<slot />
{:else if typeof activePageIndex !== 'undefined'}
	<!-- Everything else gets embedded -->
	<Dipstaging bind:activePageIndex>
		<slot />
	</Dipstaging>
{/if}
