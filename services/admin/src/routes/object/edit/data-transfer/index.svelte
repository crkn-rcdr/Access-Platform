<script lang="ts">
	import TiArrowBack from 'svelte-icons/ti/TiArrowBack.svelte';
	import type { Session } from '$lib/types';
	import SideMenuContainer from '$lib/components/shared/SideMenuContainer.svelte';
	import SideMenuPageList from '$lib/components/shared/SideMenuPageList.svelte';
	import SideMenuPageListButton from '$lib/components/shared/SideMenuPageListButton.svelte';
	import SideMenuBody from '$lib/components/shared/SideMenuBody.svelte';
	import SideMenuPage from '$lib/components/shared/SideMenuPage.svelte';
	import HammerSearchResults from '$lib/components/hammer/HammerSearchResults.svelte';
	import HammerQueueList from '$lib/components/hammer/HammerQueueList.svelte';
	import HammerStatusList from '$lib/components/hammer/HammerStatusList.svelte';
	import PrefixSlugSearchBox from '$lib/components/access-objects/PrefixSlugSearchBox.svelte';
	import type { Slug } from '@crkn-rcdr/access-data';
	import { getStores } from '$app/stores';
	import Loading from '$lib/components/shared/Loading.svelte';

	const { session } = getStores<Session>();

	export let activePageIndex: number = 0;

	let loading = false;
	let timer: NodeJS.Timeout | null = null;
	let results: any[];

	async function validateSlugList(slugs: Slug[]) {
		if (!slugs.length) return;

		loading = true;

		if (timer) clearTimeout(timer);

		timer = setTimeout(async () => {
			//error = '';
			try {
				results = [];
				const resolutions = await $session.lapin.mutation('slug.lookupMany', slugs);
				for (const res of resolutions) {
					if (res.length) {
						const slug = res[0];
						if (res.length === 2 && res[1].found && 'result' in res[1]) {
							const noid = res[1].result.id;
							results.push({ slug, noid, selected: true, found: true });
						} else {
							results.push({ slug, noid: null, selected: false, found: false });
						}
					}
				}
			} catch (e) {
				console.log(e?.message);
				//error = 'Could not valid slugs. Please contact the platform team for assistance.';
			}
			loading = false;
			results = results;
		}, 2000);
	}
</script>

<div class="dipstaging-wrap">
	<br />
	<a class="back auto-align auto-align__a-center" href="/object/edit">
		<div class="icon">
			<TiArrowBack />
		</div>

		<span> Back to search </span>
	</a>
	<br />
	<br />
	<SideMenuContainer showHeader={false} fullPage={true} bind:activeIndex={activePageIndex}>
		<SideMenuPageList>
			<SideMenuPageListButton>Bulk Force Data Transfer</SideMenuPageListButton>
			<SideMenuPageListButton>Data Transfer Queue</SideMenuPageListButton>
			<SideMenuPageListButton>Data Transfer Warnings and Failures</SideMenuPageListButton>
		</SideMenuPageList>
		<SideMenuBody>
			<SideMenuPage>
				<div class="page-wrap">
					<div class="search-wrap auto-align auto-align__wrap">
						<div style="flex:1">
							<p>Look up items by slug:</p>
							<br />
							<PrefixSlugSearchBox rows={10} on:slugs={(event) => validateSlugList(event.detail)} />
						</div>
						<div style="flex:2; margin-left: 2rem;">
							<HammerSearchResults bind:results />
							{#if loading}
								<br />
								<div class="loader">
									<Loading size="md" backgroundType="gradient" />
								</div>
							{/if}
						</div>
					</div>
				</div>
			</SideMenuPage>
			<SideMenuPage>
				<div class="page-wrap">
					<HammerQueueList />
				</div>
			</SideMenuPage>
			<SideMenuPage>
				<div class="page-wrap">
					<HammerStatusList />
				</div>
			</SideMenuPage>
		</SideMenuBody>
	</SideMenuContainer>
</div>

<!--div>
  <PrefixSelector bind:prefix />
</div-->
<style>
	a {
		text-decoration: none;
	}
	.page-wrap {
		padding: 2.5rem 4rem;
		height: 100%;
	}
	.search-wrap {
		width: 100%;
	}
	:global(.dipstaging-wrap .sidemenu) {
		margin-top: 1.8rem !important;
	}
	.back {
		margin-left: 2rem;
		color: var(--primary) !important;
		text-decoration: underline;
	}
</style>
