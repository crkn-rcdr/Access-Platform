<!--
@component
### Overview
Allows the user to modify the canvas list for a manifest.

### Properties
|    |    |    |
| -- | -- | -- |
| manifest : Manifest    | required | The manifest thats contents should be edited. |

### Usage
**Example one**
```  
<ManifestContentEditor bind:manifest />
```
*Note: `bind:` is required for changes to the object to be reflected in higher level components.*
-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { PagedManifest } from "@crkn-rcdr/access-data";
  import CanvasLabelEditor from "$lib/components/canvases/CanvasLabelEditor.svelte";
  import CanvasViewer from "$lib/components/canvases/CanvasViewer.svelte";
  import CanvasThumbnailList from "$lib/components/canvases/CanvasThumbnailList.svelte";
  import Switch from "$lib/components/shared/Switch.svelte";
  import SwitchCase from "$lib/components/shared/SwitchCase.svelte";
  import ManifestAddCanvasMenu from "$lib/components/manifests/ManifestAddCanvasMenu.svelte";
  import type { ObjectListPage } from "@crkn-rcdr/access-data";
  import { getStores } from "$app/stores";

  const { session } = getStores<Session>();
  //import type { ObjectList } from "@crkn-rcdr/access-data";

  /**
   * @type {PagedManifest} The manifest thats contents should be edited.
   */
  export let manifest: PagedManifest;

  /**
   * First page of members in the object.
   */
  export let firstPage: ObjectListPage;
  /**
   * The number of children in the object.
   */
  export let childrenCount: number;

  /**
   * @type {
      label?: Record<string, string>;
      id: string;
    } The list of canvases in the manifest actively in the viewport.
    */
  let canvases: {
    label?: Record<string, string>;
    id: string;
  }[] = [];

  /**
   * @type {{
    label?: Record<string, string>;
    id: string;
  }} The canvas being displayed in the canvas viewer.
   */
  let activeCanvas: {
    label?: Record<string, string>;
    id: string;
  };

  /**
   * @type {string} A control for what component is displayed in the free space of the content editor.
   */
  let state = "view";

  let canvasListComponent;

  /**
   * Changes the label of the active canvas to the event.detail property of the label editors @event changed
   * @param event
   * @returns void
   */
  async function setActiveCanvasLabel(event) {
    await $session.lapin.mutation("manifest.relabelCanvas", {
      id: manifest.id,
      canvas: activeCanvas.id,
      label: {
        none: event.detail,
      },
      user: $session.user,
    });
    await canvasListComponent.grabCurrentPage();
    triggerUpdate();
  }

  /**
   * Causes any parent components to be aware of changes made to the manifest.
   * @returns void
   */
  function triggerUpdate() {
    manifest = manifest;
  }

  /**
   * Sets @var state to the newState passed in.
   * @param newState
   * @returns void
   */
  function changeView(newState: string) {
    state = newState;
  }

  async function handleAddPressed(event: {
    detail: {
      selectedCanvases: { id?: string; label?: Record<string, string> }[];
    };
  }) {
    console.log(event.detail);
    const canvases = event.detail?.selectedCanvases?.map((el) => el.id);

    await $session.lapin.mutation("manifest.addCanvases", {
      id: manifest.id,
      canvases,
      user: $session.user,
    });

    await canvasListComponent.grabCurrentPage();

    const objectResponse = PagedManifest.parse(
      await $session.lapin.query("accessObject.getPaged", manifest.id)
    );

    childrenCount = objectResponse.canvases.count;
    manifest = objectResponse;
    state = "view";
  }

  function handleCancelPressed() {
    state = "view";
  }
</script>

{#if manifest}
  <!--NotificationBar
    message={typedChecks.manifest.getCanvasesValidationMsg(canvases)}
    status="fail"
  /-->
  <div class="auto-align auto-align__full content-wrapper">
    <div class="list-wrapper">
      <CanvasThumbnailList
        bind:this={canvasListComponent}
        bind:manifest
        bind:activeCanvas
        {firstPage}
        {childrenCount}
        showAddButton={state != "add"}
        on:addClicked={(event) => {
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
              {#if activeCanvas && "none" in activeCanvas["label"] && typeof activeCanvas["label"]["none"] !== "undefined"}
                <CanvasLabelEditor
                  canvasID={activeCanvas["id"]}
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
          <ManifestAddCanvasMenu
            on:cancel={handleCancelPressed}
            on:done={handleAddPressed}
          />
        </SwitchCase>
      </Switch>
    </div>
  </div>
{/if}

<style>
  .content-wrapper {
    overflow: hidden;
  }

  div {
    height: 100%;
  }

  .list-wrapper {
    margin-left: 0.1rem;
    background-color: var(--structural-div-bg);
    flex: 2.5;
    min-width: 20rem;
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

  /*.takedown {
    width: max(80%, 15rem);
    margin: auto;
    display: block;
  }*/

  /*.message {
    font-style: italic;
    font-size: var(--perfect-fourth-8);
  }

  .icon {
    display: block;
    width: var(--perfect-fourth-7);
    height: var(--perfect-fourth-7);
    margin-left: 0.5rem;
    margin-top: 0;
  }*/
</style>
