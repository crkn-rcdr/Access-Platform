<script context="module" lang="ts">
	/**
	 * @module
	 * @description Creates a lapin router for the app to interact with
	 */
	import type { LapinRouter } from '@crkn-rcdr/lapin-router';
	import type { Load } from '@sveltejs/kit';
	import type { TRPCClient } from '@trpc/client';
	import type { RootLoadOutput, ServerSession, Session, HttpClient } from '$lib/types';
	import { createTRPCClient } from '@trpc/client';

	export const load: Load<{ session: ServerSession }, RootLoadOutput> = ({
		fetch,
		session: { restEndpoint, apiEndpoint }
	}) => {
		const lapin = createTRPCClient<LapinRouter>({
			url: apiEndpoint,
			fetch
		});
		//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

		return {
			stuff: { lapin, restEndpoint },
			props: { lapin, restEndpoint }
		};
	};
</script>

<script lang="ts">
	/**
	 * @template
	 * @description This is the common layout for the application
	 */
	import FaRegQuestionCircle from 'svelte-icons/fa/FaRegQuestionCircle.svelte';
	import FaRegUserCircle from 'svelte-icons/fa/FaRegUserCircle.svelte';

	import { getStores, page } from '$app/stores';
	import DropdownMenu from '$lib/components/shared/DropdownMenu.svelte';

	/**
	 * @type {TRPCClient<LapinRouter>} Allows the app to to speak to the lapin api
	 */
	export let lapin: TRPCClient<LapinRouter>;

	export let restEndpoint: string;

	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();

	/** Allows all other pages to access lapin */
	session.set({ ...$session, lapin, restEndpoint });
</script>

<div
	class="site-nav auto-align auto-align__block auto-align__a-center auto-align__j-between auto-align__wrap"
>
	<a href="/">
		<img width="220" src="/canadiana-pa-tag-color.png" alt="canadiana by CRKN, par RCDR" />
	</a>
	<div class="right-menu auto-align auto-align__a-center">
		<a
			href="https://github.com/crkn-rcdr/Access-Platform/blob/main/Help.md"
			target="_blank"
			data-tooltip="Click to read the glossary and how-to guides!"
			data-tooltip-flow="bottom"
		>
			<div class="icon">
				<FaRegQuestionCircle />
			</div>
		</a>

		<div>
			<DropdownMenu direction="right">
				<div slot="dropdown-button" class="icon">
					<FaRegUserCircle />
				</div>
				<div class="disabled">
					Logged in as: <b>{$session.user.name}</b>, {$session.user.email}.
				</div>
			</DropdownMenu>
		</div>
	</div>
</div>

<br />

<ul class="nav nav-tabs">
	<li class="nav-item">
		<a
			class="nav-link"
			class:active={$page.url.pathname.includes('/smelter')}
			aria-current="page"
			href="/smelter/find"
		>
			Import Images from Preservation
		</a>
	</li>

	<li class="nav-item">
		<a class="nav-link" class:active={$page.url.pathname.includes('/dmd')} href="/dmd"
			>Load Descriptive Metadata</a
		>
	</li>
	<li class="nav-item">
		<a class="nav-link" class:active={$page.url.pathname.includes('/object')} href="/object/edit"
			>Manage IIIF</a
		>
	</li>
	<li class="nav-item">
		<a class="nav-link" class:active={$page.url.pathname.includes('/ocr')} href="/ocr">Manage OCR</a
		>
	</li>
</ul>

<slot />

<style>
	@font-face {
		font-family: 'Roboto';
		src: url('/fonts/Roboto-Regular.ttf') format('truetype');
	}
	div {
		position: relative;
	}
	.site-nav {
		/*background-color: var(--nav-bg);*/
		margin: 0;
		padding: 0 1rem;
		min-height: 6rem;
	}
	.icon {
		padding: 0.1rem;
	}
	nav > * {
		font-family: 'Roboto';
		color: var(--secondary) !important;
		width: fit-content;
		height: 6rem;
		padding: 0 4rem;
		/*background: var(--nav-item-bg);*/
	}
	a {
		text-decoration: none !important;
	}
	.active-nav-item {
		background: var(--nav-item-active-bg) !important;
		color: var(--primary) !important;
	}
	nav > *:not(.active-nav-item):hover {
		color: var(--dark-font) !important;
	}
	.right-menu {
		height: 4rem;
	}
	.right-menu > * {
		margin-right: 1rem;
	}
	:global(.navbar .create-object-menu-button) {
		height: 6rem;
		padding: 0 4rem;
		color: var(--secondary);
		/*background: var(--nav-item-bg);*/
	}
	:global(.navbar .create-object-menu-button:hover) {
		/*background: #fefefe; */
		color: var(--dark-font) !important;
	}
</style>
