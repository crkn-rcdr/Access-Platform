<script>
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";

  let objects = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
</script>

<div class="wrapper">
  <div class="hero hero__gradient full-bleed">
    <div class="wrapper">
      <h1>Storage</h1>
      <p>Manage the objects that have been put into storage</p>
    </div>
  </div>
  <br />
  <br />
  <SideMenuContainer fullPage={false} activeIndex={1}>
    <SideMenuPageList>
      <SideMenuPageListButton>Canvases</SideMenuPageListButton>
      <SideMenuPageListButton>Manifests</SideMenuPageListButton>
      <SideMenuPageListButton>Collections</SideMenuPageListButton>
    </SideMenuPageList>
    <SideMenuBody>
      <SideMenuPage>
        <!--h6>Canvases</h6>
        <br /-->

        <div class="auto-grid">
          {#each objects as object}
            <div class="object">{object}</div>
          {/each}
        </div>
      </SideMenuPage>
      <SideMenuPage>
        <!--h6>Manifests</h6>
        <br /-->

        <div class="auto-grid">
          {#each objects as object}
            <div class="object">{object}</div>
          {/each}
        </div>
      </SideMenuPage>
      <SideMenuPage>
        <!--h6>Collections</h6>
        <br /-->

        <div class="auto-grid">
          {#each objects as object}
            <div class="object">{object}</div>
          {/each}
        </div>
      </SideMenuPage>
    </SideMenuBody>
  </SideMenuContainer>
</div>

<style>
  .object {
    width: 10rem;
    height: 10rem;
    background-color: var(--grey);
    margin: auto;
  }

  h6 {
    text-align: center;
  }
</style>
