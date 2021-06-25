<script lang="ts">
  //See: https://svelte.dev/tutorial/svelte-component and https://svelte.dev/repl/74593f36569a4c268d8a6ab277db34b5?version=3.12.1

  import { onMount } from "svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import type { SideMenuPageData } from "$lib/types";

  /** Option a menu that takes up the entire body of a page, or an inline menu. */
  export let fullPage = true;

  /** Handles generating the side menu buttons and pages dynamically through an array */
  export let pageList: Array<SideMenuPageData> | undefined = undefined;

  let pageNames: string[] = []; // Makes it easier to generate the sidenav buttons list
  let pageComponents: any[] = []; // Makes it easier to generate the page body list
  let instances: any = {}; // Keeps track of the actual instances of the components dynamically created throughsvelte:component.

  $: pageNames = pageList ? pageList.map((el) => el["name"]) : [];
  $: pageComponents = pageList ? pageList.map((el) => el["componentData"]) : [];
  $: {
    for (let key in instances) {
      instances[key].$$.after_update.push(() => {
        pageComponents[parseInt(key)].update(); // Any time the instances object changes, add a callback to each component instance that triggers the update method passed in through the SideMenuPageData objects in the pageList array property.
      });
    }
  }

  /** Handles the hiding and showing of pages based on user interaction with the menu */
  let container: HTMLDivElement;
  let pageButtons: NodeListOf<Element>;
  let pageBodies: NodeListOf<Element>;

  let activeIndex = 0;

  function setActivePageButtonClass() {
    for (let i = 0; i < pageButtons.length; i++) {
      if (i === activeIndex) pageButtons?.[i]?.classList?.add("active");
      else {
        pageBodies?.[i]?.classList?.add("display-hidden");
        pageButtons?.[i]?.classList?.remove("active");
      }
    }
  }

  function setActivePageBody() {
    for (let i = 0; i < pageBodies.length; i++) {
      if (i === activeIndex)
        pageBodies?.[i]?.classList?.remove("display-hidden");
      else pageBodies?.[i]?.classList?.add("display-hidden");
    }
  }

  function setPage() {
    setActivePageButtonClass();
    setActivePageBody();
  }

  function enablePaging() {
    for (let i = 0; i < pageButtons.length; i++) {
      pageButtons?.[i]?.addEventListener("click", () => {
        activeIndex = i;
        setPage();
      });
    }
  }

  onMount(() => {
    pageButtons = container.querySelectorAll(".side-menu-page-list-button");
    pageBodies = container.querySelectorAll(".side-menu-page");
    enablePaging();
    setPage();
  });
</script>

<div
  bind:this={container}
  class="side-menu-container"
  class:fixed-full-page={fullPage}
>
  <slot name="side-menu-header" />

  <div class="auto-align auto-align__a-stretch">
    {#if pageList}
      <SideMenuPageList>
        {#each pageNames as pageName}
          <SideMenuPageListButton>{pageName}</SideMenuPageListButton>
        {/each}
      </SideMenuPageList>

      <SideMenuBody>
        {#each pageComponents as pageComponentData, i}
          <SideMenuPage>
            <svelte:component
              this={pageComponentData["component"]}
              {...pageComponentData["props"]}
              bind:this={instances[i]}
            />
          </SideMenuPage>
        {/each}
      </SideMenuBody>
    {:else}
      <slot />
    {/if}
  </div>
</div>

<style>
  .side-menu-container {
    width: 100%;
    height: 100%;
  }

  .side-menu-container.fixed-full-page {
    position: fixed;
    top: calc(4.5rem + var(--viewport-scaling));
    bottom: 7rem;
    right: 0;
    left: 0;
  }
</style>
