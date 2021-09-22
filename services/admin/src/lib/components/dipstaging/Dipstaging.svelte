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
  import DipstagingLookup from "$lib/components/dipstaging/DipstagingLookup.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import SideMenuContainer from "../shared/SideMenuContainer.svelte";
  import SideMenuPageList from "../shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "../shared/SideMenuPageListButton.svelte";
  import SideMenuBody from "../shared/SideMenuBody.svelte";
  import SideMenuPage from "../shared/SideMenuPage.svelte";

  export let activePageIndex: number = 0;
  export let activeStepIndex: number = 0;
</script>

<SideMenuContainer
  showHeader={false}
  fullPage={false}
  bind:activeIndex={activePageIndex}
>
  <SideMenuPageList>
    <a href="/smelter">
      <SideMenuPageListButton>New Job</SideMenuPageListButton>
    </a>
    <a href="/smelter/processing">
      <SideMenuPageListButton>Processing</SideMenuPageListButton>
    </a>
    <a href="/smelter/success">
      <SideMenuPageListButton>Successes</SideMenuPageListButton>
    </a>
    <a href="/smelter/failed">
      <SideMenuPageListButton>Failed</SideMenuPageListButton>
    </a>
  </SideMenuPageList>
  <SideMenuBody>
    <SideMenuPage>
      <div class="page-wrap">
        <ScrollStepper
          bind:activeStepIndex
          displayPrevious={true}
          enableAutoScrolling={false}
        >
          <ScrollStepperStep title="Find items in preservation">
            <div slot="icon">1</div>
            <DipstagingLookup />
          </ScrollStepperStep>
          <ScrollStepperStep title="Add them to access" isLastStep={true}>
            <div slot="icon">2</div>
            <slot />
          </ScrollStepperStep>
        </ScrollStepper>
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
