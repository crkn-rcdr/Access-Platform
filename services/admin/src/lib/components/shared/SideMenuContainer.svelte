<script lang="ts">
  import { onMount } from "svelte";

  export let fullPage = true;

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
  <div class="auto-align auto-align__a-stretch ">
    <slot />
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
