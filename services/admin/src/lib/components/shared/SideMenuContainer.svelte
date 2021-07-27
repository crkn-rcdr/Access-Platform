<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import { onMount } from "svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import type { SideMenuPageData } from "$lib/types";

  /** Option a menu that takes up the entire body of a page, or an inline menu. */
  export let fullPage = true;

  /** Sets the initital active page */
  export let activeIndex = 0;

  /** Handles generating the side menu buttons and pages dynamically through an array
   *  Developers can use either this list or just build their menus by putting in their own template components.
   */
  export let pageList: Array<SideMenuPageData> = [];

  let pageNames: string[] = []; // Makes it easier to generate the sidenav buttons list
  let pageComponents: any[] = []; // Makes it easier to generate the page body list
  let instances: any = {}; // Keeps track of the actual instances of the components dynamically created through svelte:component.

  /** Any time the page list changes, redraw the menus and pages. */

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  $: pageNames = pageList.map((el) => el["name"]);

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  $: pageComponents = pageList.map((el) => el["componentData"]);

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  $: {
    for (const key in instances) {
      instances[key].$$.after_update.push(() => {
        pageComponents[parseInt(key)].update(); // Any time the instances object changes, add a callback to each component instance that triggers the update method passed in through the SideMenuPageData objects in the pageList array property.
      });
    }
  }

  /** Handles the hiding and showing of pages based on user interaction with the menu */
  let container: HTMLDivElement;
  let pageButtons: NodeListOf<Element>;
  let pageBodies: NodeListOf<Element>;

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function setActivePageButtonClass() {
    for (let i = 0; i < pageButtons.length; i++) {
      if (i === activeIndex) pageButtons?.[i]?.classList?.add("active");
      else {
        pageBodies?.[i]?.classList?.add("display-hidden");
        pageButtons?.[i]?.classList?.remove("active");
      }
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function setActivePageBody() {
    for (let i = 0; i < pageBodies.length; i++) {
      if (i === activeIndex)
        pageBodies?.[i]?.classList?.remove("display-hidden");
      else pageBodies?.[i]?.classList?.add("display-hidden");
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function setPage() {
    setActivePageButtonClass();
    setActivePageBody();
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function enablePaging() {
    for (let i = 0; i < pageButtons.length; i++) {
      pageButtons?.[i]?.addEventListener("click", () => {
        activeIndex = i;
        setPage();
      });
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  onMount(() => {
    pageButtons = container.querySelectorAll(".side-menu-page-list-button");
    pageBodies = container.querySelectorAll(".side-menu-page");
    enablePaging();
    setPage();
  });
</script>

<div bind:this={container} class="side-menu-container">
  <div class:fixed-full-page={fullPage}>
    <div class="header">
      <slot name="side-menu-header" />
    </div>
    <div class="menu">
      <div
        class="auto-align auto-align__full auto-align auto-align__a-stretch auto-align auto-align__wrap"
      >
        {#if pageList.length}
          <SideMenuPageList>
            {#each pageNames as pageName}
              <SideMenuPageListButton>{pageName}</SideMenuPageListButton>
            {/each}
          </SideMenuPageList>

          <SideMenuBody>
            {#each pageComponents as pageComponentData, i}
              <SideMenuPage {...pageComponentData["sideMenuPageProps"]}>
                <svelte:component
                  this={pageComponentData["contentComponent"]}
                  {...pageComponentData["contentComponentProps"]}
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
  </div>
</div>

<style>
  .side-menu-container {
    width: 100%;
    position: relative;
  }

  .fixed-full-page {
    position: fixed;
    top: calc(4.5rem + var(--viewport-scaling));
    bottom: 0;
    right: 0;
    left: 0;
    height: calc(100vh - 4.5rem - var(--viewport-scaling));
  }

  .fixed-full-page .header {
    height: 12%;
    width: 100%;
  }
  .fixed-full-page .menu {
    height: 88%;
    width: 100%;
  }
</style>
