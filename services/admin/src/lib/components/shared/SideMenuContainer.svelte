<script lang="ts">
  //See: https://svelte.dev/tutorial/svelte-component and https://svelte.dev/repl/74593f36569a4c268d8a6ab277db34b5?version=3.12.1

  import { onMount } from "svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";

  /** */
  export let fullPage = true;

  /** */
  export let pageList:
    | Array<{ name: string; componentData: { component: any; props: any } }> //ex: props {page1Prop: 1}
    | undefined = undefined;
  //let enableSetup = false;

  let pageNames: string[] = [];
  let pageComponents: any[] = [];

  $: console.log("pageList", pageList, pageNames, pageComponents);

  /*$: {
    pageList;
    if (enableSetup) {
      setup();
    }
  }*/
  $: pageNames = pageList ? pageList.map((el) => el["name"]) : [];
  $: pageComponents = pageList ? pageList.map((el) => el["componentData"]) : [];

  /** */
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

  function setup() {
    pageButtons = container.querySelectorAll(".side-menu-page-list-button");
    pageBodies = container.querySelectorAll(".side-menu-page");
    console.log("els", pageButtons, pageBodies);
    enablePaging();
    setPage();
  }

  onMount(() => {
    setup();
    //enableSetup = true;
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
        {#each pageComponents as pageComponentData}
          <SideMenuPage>
            <svelte:component
              this={pageComponentData["component"]}
              {...pageComponentData["props"]}
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
