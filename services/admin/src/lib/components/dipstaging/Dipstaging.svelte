<!--
@component
### Overview
This component controls the rendering of the dipstaging menu (smelter) based on the activePageIndex

### Properties
|    |    |    |
| -- | -- | -- |
| activePageIndex : number | required | The index of the page to be displayed |

### Usage
```  
<Dipstaging bind:activePageIndex>
  ...content
</Dipstaging>
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import Toolbar from "../shared/Toolbar.svelte";

  /**
   * @type {number} The index of the page to be displayed in the list of pages in the SideMenuContainer. This is set based of of the URL in the layout.
   */
  export let activePageIndex: number = 0;
</script>

<div class="dipstaging-wrap">
  <SideMenuContainer
    showHeader={false}
    fullPage={true}
    bind:activeIndex={activePageIndex}
  >
    <SideMenuPageList>
      <a href="/smelter/find">
        <SideMenuPageListButton>Package Finder</SideMenuPageListButton>
      </a>
      <a href="/smelter/queue/1/10/all">
        <SideMenuPageListButton>Import Queue</SideMenuPageListButton>
      </a>
      <a href="/smelter/status/1/10/all">
        <SideMenuPageListButton>Warnings and Failures</SideMenuPageListButton>
      </a>
      <a href="/smelter/neversmelted/1/10/all">
        <SideMenuPageListButton>Packages Never Imported</SideMenuPageListButton>
      </a>
      <a href="/smelter/updated/1/10/all">
        <SideMenuPageListButton
          >Packages with Recent Activity</SideMenuPageListButton
        >
      </a>
    </SideMenuPageList>
    <SideMenuBody>
      <SideMenuPage>
        <div class="page-wrap">
          <slot />
        </div></SideMenuPage
      >
      <SideMenuPage>
        <div class="page-wrap">
          <slot />
        </div>
      </SideMenuPage>
      <SideMenuPage>
        <div class="page-wrap">
          <slot />
        </div>
      </SideMenuPage>
      <SideMenuPage>
        <div class="page-wrap">
          <slot />
        </div>
      </SideMenuPage>
      <SideMenuPage>
        <div class="page-wrap">
          <slot />
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
    padding: 3rem 4rem;
    height: 100%;
  }
  :global(.dipstaging-wrap .sidemenu) {
    margin-top: 2.3rem !important;
  }
</style>
