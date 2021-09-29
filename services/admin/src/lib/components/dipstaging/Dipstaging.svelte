<!--
@component
### Overview
The resolver component allows the user to enter a slug, and then a request is sent to the backend to vheck if an object exists with that slug. Error states are shown for invalid slugs or otherwise.
### Properties
|    |    |    |
| -- | -- | -- |
| slug : string                      | optional | Slug being resolved. |
| noid: string | null | undefined    | optional | Noid that the slug resolves to, or null. |
| hideInitial : boolean              | optional | Whether to hide the display when the current slug is the same as the initial slug provided. |
### Usage
```  
  <Resolver
    bind:slug={object["slug"]}
    noid={object["id"]}
    on:available={(event) => {
      ..do something
    }}
  />
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  import SideMenuContainer from "../shared/SideMenuContainer.svelte";
  import SideMenuPageList from "../shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "../shared/SideMenuPageListButton.svelte";
  import SideMenuBody from "../shared/SideMenuBody.svelte";
  import SideMenuPage from "../shared/SideMenuPage.svelte";

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
    <a href="/smelter/neversmelted/1">
      <SideMenuPageListButton>Non-Smelted Packages</SideMenuPageListButton>
    </a>
    <a href="/smelter/updated/1">
      <SideMenuPageListButton
        >Packages Needing Re-Smelting</SideMenuPageListButton
      >
    </a>
    <a href="/smelter/queue/1">
      <SideMenuPageListButton>Smelting Queue</SideMenuPageListButton>
    </a>
    <a href="/smelter/status/1">
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
    padding: 1rem;
    height: 100%;
  }
</style>
