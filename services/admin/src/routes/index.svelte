<script lang="ts">
	/**
	 * @file
	 * @description This is the main page for the app
	 */
	import DropdownMenu from '$lib/components/shared/DropdownMenu.svelte';
	import { getStores, page } from '$app/stores';
	import type { Session } from '$lib/types';
	/**
	 * @type {Session} The session store that contains the module for sending requests to lapin.
	 */
	const { session } = getStores<Session>();
	//import NotificationBar from "$lib/components/shared/NotificationBar.svelte"
	let name = '';

	$: name = $session?.user?.name?.split(' ')[0];
</script>

<div class="notifications">
	<!--NotificationBar message="New fix pushed!" status="success" />
    <NotificationBar message="There is some error!" status="fail" />
    <NotificationBar
      message="The platform is experiencing an outage."
      status="warn"
    /-->
</div>

{#if $page.url.pathname === '/'}
	<br />
	<br />
	<div class="home-content auto-align auto-align__column auto-align__a-center auto-align__j-center">
		<h4>
			Hi{name.length ? `, ${name}` : ''}. What would you like to do today?
		</h4>
	</div>

	<div class="container">
		<br />

		<div class="row">
			<div class="col-sm-6">
				<div class="card">
					<h5 class="card-header">Import Images</h5>
					<div class="card-body">
						<p class="card-text">Import images from preservation into the access image storage.</p>
						<br />
						<a href="/smelter/find" class="btn btn-primary">Go</a>
					</div>
				</div>
			</div>

			<div class="col-sm-6">
				<div class="card">
					<h5 class="card-header">Load Descriptive Metadata</h5>
					<div class="card-body">
						<p class="card-text">
							Load MARC and DC descriptive metadata files into the access storage. (Temporary
							feature - you can also use this tool to load descriptive metadata into preservation.)
						</p>
						<a href="/dmd" class="btn btn-primary">Go</a>
					</div>
				</div>
			</div>
		</div>

		<br />

		<div class="row">
			<div class="col-sm-6">
				<div class="card">
					<h5 class="card-header">Manage IIIF</h5>
					<div class="card-body">
						<p class="card-text">Create and edit IIIF manifests and collections.</p>
						<br />
						<a href="/object/edit" class="btn btn-primary">Go</a>
					</div>
				</div>
			</div>

			<div class="col-sm-6">
				<div class="card">
					<h5 class="card-header">Manage OCR</h5>
					<div class="card-body">
						<p class="card-text">
							Export images for OCR, import the resulting OCR files, and create PDFs from their OCR
							data.
						</p>
						<a href="/ocr" class="btn btn-primary">Go</a>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!--div class="title">
    <img
      class="logo"
      src="/canadiana-pa-tag-color.png"
      alt="Canadiana by CRKN, par RCDR"
    />
  </div>
  <div class="search">
    <TypeAhead
      placeholder="Search for existing collections and manifests to edit..."
      on:selected={slugSelected}
    />
  </div-->
<style>
	.notifications {
		padding-top: var(--perfect-fourth-3);
	}
	.home-content {
		width: 100%;
	}
	nav > * {
		font-family: 'Roboto';
		width: fit-content;
		height: 6rem;
		padding: 0 1rem;
		/*background: var(--nav-item-bg);*/
		color: var(--dark-font) !important;
		background: var(--primary);
		color: var(--light-font) !important;
		margin-top: 1rem;
		margin-right: 0.5rem;
		margin-left: 0.5rem;
		border-radius: var(--border-radius);
		min-width: 13rem;
	}
	nav > *:hover {
		filter: brightness(1.1);
	}
	a {
		text-decoration: none !important;
	}
	:global(.drop-down-wrap-page > div) {
		align-items: center;
		color: var(--dark-font);
	}
	:global(.drop-down-wrap-page .create-object-menu-button) {
		height: 6rem;
		color: var(--light-font) !important;
	}
	.card {
		min-height: 180px !important;
	}
	/*
  .title,
  .title img {
    position: relative;
    margin: auto;
  }

  .logo {
    width: 22rem;
  }
  .search {
    position: relative;
    margin: auto;
    width: 65%;
    margin-top: var(--perfect-fourth-2);
    min-width: 25rem;
  }

  @media (min-width: 1025px) {
    .logo {
      width: 34rem;
    }
    .search {
      padding-left: 5.5rem;
    }
  }*/
</style>
