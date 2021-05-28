<script lang="ts">
  import IoMdCopy from "svelte-icons/io/IoMdCopy.svelte";
  import TiTabsOutline from "svelte-icons/ti/TiTabsOutline.svelte";
  import GoDiffAdded from "svelte-icons/go/GoDiffAdded.svelte";
  import TiDocumentAdd from "svelte-icons/ti/TiDocumentAdd.svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import { createEventDispatcher } from "svelte";
  import Align from "../shared/Align.svelte";
  import AutomaticResizeInput from "../shared/AutomaticResizeInput.svelte";
  import DynamicDragAndDropList from "../shared/DynamicDragAndDropList.svelte";

  export let canvases = [];

  let activeCanvas = "1";

  const dispatch = createEventDispatcher();

  function thumbnailClicked(index) {
    dispatch("thumbnailClicked", { index });
  }
</script>

<div class="list">
  <DynamicDragAndDropList bind:dragList={canvases}>
    {#each canvases as canvas, i}
      <div class="thumbnail" on:click={(e) => thumbnailClicked(i)}>
        <Align vertical="flex-start">
          <div class="actions-wrap">
            <Align vertical="flex-start" direction="column">
              <div class="action">
                <AutomaticResizeInput
                  type="number"
                  name="position"
                  value={i + 1}
                />
              </div>
              <div class="action icon"><TiTabsOutline /></div>
              <div class="action icon"><TiDocumentAdd /></div>
              <div class="action icon"><TiTrash /></div>
            </Align>
          </div>
          <div class="image-wrap" class:active={activeCanvas === canvas["id"]}>
            <!--some content would be nice {canvas["id"]}-->
            <img
              src="https://i.pinimg.com/originals/9e/7b/d3/9e7bd39f635900028cd26596cbda365a.jpg"
            />
          </div>
        </Align>
      </div>
    {/each}
  </DynamicDragAndDropList>
</div>

<style>
  .list {
    width: 361px;
    background-color: rgb(240 240 240);
    height: 100%;
    overflow-y: auto;
  }

  .thumbnail {
    height: 250px;
    width: 100%;
    background-color: rgb(235, 235, 235);
    margin: auto;
    margin-bottom: 24px;
  }

  .thumbnail:nth-child(1) {
    margin-top: 24px;
  }

  .actions-wrap {
    flex: 1;
    margin-left: 24px;
  }

  .actions-wrap .action.icon {
    margin-top: 0.5em;
    width: 28px;
    height: 28px;
    opacity: 0.6;
    cursor: pointer;
  }

  .image-wrap {
    flex: 9;
    text-align: center;
    margin-left: 12px;
  }

  .actions-wrap,
  .image-wrap {
    margin-top: 24px;
  }

  .active {
    /*border: 2px solid;
        border-image-slice: 1;
        border-width: 2px;
        border-image-source: var(--gradient);*/
  }

  .image-wrap img {
    height: 200px;
  }
</style>
