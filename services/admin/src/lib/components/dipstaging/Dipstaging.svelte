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

  /**
   * @type {number} The index of the page to be displayed in the list of pages in the SideMenuContainer. This is set based of of the URL in the layout.
   */
  export let activePageIndex: number = 0;
</script>

<SideMenuContainer
  showHeader={false}
  fullPage={false}
  bind:activeIndex={activePageIndex}
>
  <SideMenuPageList>
    <a href="/smelter/find">
      <SideMenuPageListButton>Package Finder</SideMenuPageListButton>
    </a>
    <a href="/smelter/neversmelted/1/10/all">
      <SideMenuPageListButton>Packages Never Smelted</SideMenuPageListButton>
    </a>
    <a href="/smelter/updated/1/10/all">
      <SideMenuPageListButton
        >Packages Needing Re-Smelting</SideMenuPageListButton
      >
    </a>
    <a href="/smelter/queue/1/10/all">
      <SideMenuPageListButton>Smelting Queue</SideMenuPageListButton>
    </a>
    <a href="/smelter/status/1/10/all">
      <SideMenuPageListButton>Smelter Results</SideMenuPageListButton>
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

<!--div>
  <PrefixSelector bind:prefix />
</div-->
<style>
  a {
    text-decoration: none;
  }
  .page-wrap {
    padding: 2rem 4rem;
    height: 100%;
  }
</style>
