<script lang="ts">
  import { onMount } from "svelte";
  import type {
    CanvasManifest,
    Canvas,
  } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "$lib/components/shared//Align.svelte";
  import CanvasLabelEditor from "../canvases/CanvasLabelEditor.svelte";
  import CanvasViewer from "../canvases/CanvasViewer.svelte";
  import CanvasThumbnailList from "../canvases/CanvasThumbnailList.svelte";
  import Switch from "$lib/components/shared//Switch.svelte";
  import SwitchCase from "$lib/components/shared//SwitchCase.svelte";
  import ManifestAddCanvasMenu from "$lib/components/manifests/ManifestAddCanvasMenu.svelte";

  export let manifest: CanvasManifest;

  let activeCanvas: Canvas | null;
  let state = "view";

  function setActiveCanvas(index: number) {
    activeCanvas = manifest?.canvases?.[index] || null;
    triggerUpdate();
  }

  function triggerUpdate() {
    manifest.canvases = manifest.canvases;
  }

  function changeView(newState: string) {
    state = newState;
  }

  onMount(() => {
    activeCanvas = manifest?.canvases?.[0] || null;
  });
</script>

{#if manifest && activeCanvas}
  <Align>
    <div class="list-wrapper">
      <CanvasThumbnailList
        showAddButton={state != "add"}
        bind:canvases={manifest["canvases"]}
        on:thumbnailClicked={(e) => {
          setActiveCanvas(e.detail.index);
        }}
        on:addClicked={() => {
          changeView("add");
        }}
      />
    </div>
    <div class="state-wrap">
      <Switch bind:checkVal={state}>
        <SwitchCase caseVal="view">
          <Align>
            <div class="view-wrap">
              <CanvasViewer canvas={activeCanvas} />
            </div>
            <div class="label-wrap">
              <CanvasLabelEditor
                bind:canvas={activeCanvas}
                on:changed={triggerUpdate}
              />
            </div>
          </Align>
        </SwitchCase>
        <SwitchCase caseVal="add">
          <!--TODO: Should we add the canvases after the selected canvas or just at the begining or end of the manifest?-->
          <ManifestAddCanvasMenu
            bind:destinationManifest={manifest}
            on:done={() => {
              state = "view";
              setActiveCanvas(0);
            }}
          />
        </SwitchCase>
      </Switch>
    </div>
  </Align>
{/if}

<style>
  div {
    height: 100%;
  }

  .list-wrapper {
    background-color: var(--structural-div-bg);
    flex: 2.5;
  }

  .view-wrap {
    flex: 2;
  }

  .label-wrap {
    flex: 1;
    overflow-y: hidden;
    width: 20rem;
  }

  .state-wrap {
    flex: 9;
  }
</style>
