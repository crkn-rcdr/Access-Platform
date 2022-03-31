<script lang="ts">
  /**
   * @file
   * @description This is the main page for the app
   */
  import DropdownMenu from "$lib/components/shared/DropdownMenu.svelte";
  import { getStores, page } from "$app/stores";
  import type { Session } from "$lib/types";
  import { onMount } from "svelte";
  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();
  //import NotificationBar from "$lib/components/shared/NotificationBar.svelte"
  let name = "";

  $: name = $session?.user?.name?.split(" ")[0];

  onMount(async () => {
    await $session?.hare("dmdTask/6557a92fb5cee680075de6dfa9ee2a7a", {
      method: "GET",
    });
    const res = await $session?.hare(
      "dmdTask/resultCSV/6557a92fb5cee680075de6dfa9ee2a7a",
      {
        method: "GET",
      }
    );
    const fileBlob = await res.blob();
    const url = window.URL.createObjectURL(fileBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
    a.click();
    a.remove(); //afterwards we remove the element again
    URL.revokeObjectURL(url);
  });
</script>

<div class="notifications">
  <!--NotificationBar message="New fix pushed!" status="success" />
    <NotificationBar message="There is some error!" status="fail" />
    <NotificationBar
      message="The platform is experiencing an outage."
      status="warn"
    /-->
</div>

{#if $page.path === "/"}
  <br />
  <br />
  <div
    class="home-content auto-align auto-align__column auto-align__a-center auto-align__j-center"
  >
    <h4>
      Hi {name.length ? `, ${name}` : ""}. What would you like to do today?
    </h4>
    <nav class="auto-align auto-align__wrap">
      <span
        class="drop-down-wrap-page auto-align auto-align__a-center auto-align__j-center"
      >
        <DropdownMenu direction="right">
          <div
            slot="dropdown-button"
            class="create-object-menu-button auto-align auto-align__a-center"
          >
            Create in Access
          </div>
          <a href="/object/new/collection"> New Collection </a>
          <a href="/object/new/manifest"> New Manifest </a>
        </DropdownMenu>
      </span>

      <a
        class="auto-align auto-align__a-center auto-align__j-center"
        href="/smelter/find"
      >
        Import into Access
      </a>

      <a
        class="auto-align auto-align__a-center auto-align__j-center"
        href="/dmd"
      >
        Load Metadata
      </a>

      <a
        class="auto-align auto-align__a-center auto-align__j-center"
        href="/object/edit"
      >
        Edit in Access
      </a>

      <a
        class="auto-align auto-align__a-center auto-align__j-center"
        href="/ocr"
      >
        Load OCR
      </a>
    </nav>
  </div>
{/if}

<!--div class="title">
    <img
      class="logo"
      src="/static/canadiana-pa-tag-color.png"
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
    font-family: "Roboto";
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
