<script lang="ts">
  import { onMount } from "svelte";
  import type { Manifest } from "@crkn-rcdr/access-data/src/access/Manifest";
  import CanvasLabelEditor from "../canvases/CanvasLabelEditor.svelte";
  import CanvasViewer from "../canvases/CanvasViewer.svelte";
  import CanvasThumbnailList from "../canvases/CanvasThumbnailList.svelte";
  import Switch from "$lib/components/shared//Switch.svelte";
  import SwitchCase from "$lib/components/shared//SwitchCase.svelte";
  import ManifestAddCanvasMenu from "$lib/components/manifests/ManifestAddCanvasMenu.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import { typedChecks } from "$lib/validation";

  export let manifest: Manifest;

  let activeCanvas: any;
  let activeCanvasIndex: number = 0;
  let state = "view";

  function setActiveCanvas(index: number) {
    activeCanvasIndex = index;
    activeCanvas = manifest?.canvases?.[index] || null;
    triggerUpdate();
  }

  function setActiveCanvasLabel(event) {
    manifest.canvases[activeCanvasIndex]["label"]["none"] = event.detail;
    triggerUpdate();
  }

  function triggerUpdate() {
    manifest = manifest;
  }

  function changeView(newState: string) {
    state = newState;
  }

  onMount(() => {
    activeCanvas = manifest?.canvases?.[0] || null;
  });
</script>

{#if manifest}
  <NotificationBar
    message={typedChecks.manifest.getCanvasesValidationMsg(manifest.canvases)}
    status="fail"
  />
  <div class="auto-align auto-align__full">
    <div class="list-wrapper">
      <!--button
        on:click={() => {
          manifest.canvases[activeCanvasIndex]["label"]["none"] = null;
          triggerUpdate();
        }}>test error</button
      > uncomment to test canvas error -->
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
          <div class="auto-align auto-align__full">
            <div class="view-wrap">
              {#if activeCanvas}
                <CanvasViewer canvas={activeCanvas} />
              {/if}
            </div>
            <div class="label-wrap">
              {#if activeCanvas && activeCanvas?.["label"]?.["none"]}
                <CanvasLabelEditor
                  bind:label={activeCanvas["label"]["none"]}
                  on:changed={setActiveCanvasLabel}
                >
                  <!--Todo, own component-->
                  <!--a class="takedown" href="/takedown" target="_blank">
                    <div
                      class="auto-align auto-align__full auto-align auto-align__a-center"
                    >
                      <div class="message">
                        Take this canvas off of the platform
                      </div>
                      <div class="icon">
                        <IoMdOpen />
                      </div>
                    </div>
                  </a-->
                </CanvasLabelEditor>
              {/if}
            </div>
          </div>
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
  </div>
{/if}

<style>
  div {
    height: 100%;
  }

  .list-wrapper {
    background-color: var(--structural-div-bg);
    flex: 2.5;
    border-top: 1px solid rgba(100, 100, 100, 0.2);
  }

  .view-wrap {
    flex: 2;
  }

  .label-wrap {
    flex: 1;
    overflow-y: hidden;
  }

  .state-wrap {
    flex: 9;
  }

  .view-wrap,
  .label-wrap,
  .state-wrap {
    background-color: var(--backdrop-bg);
  }

  .takedown {
    width: max(80%, 15rem);
    margin: auto;
    display: block;
  }

  .message {
    font-style: italic;
    font-size: var(--perfect-fourth-8);
  }

  .icon {
    display: block;
    width: var(--perfect-fourth-7);
    height: var(--perfect-fourth-7);
    margin-left: 0.5rem;
    margin-top: 0;
  }
</style>
