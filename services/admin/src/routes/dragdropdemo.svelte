<script lang="ts">
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  let dragListGrid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let dragListVert = [1, 2, 3, 4, 5, 6];
  let dragListHoriz = [1, 2, 3, 4, 5];
</script>

<h1>Drag and drop examples</h1>

<h2>Drag and drop grid</h2>
<DynamicDragAndDropList direction="both" bind:dragList={dragListGrid}>
  {#each dragListGrid as item}
    <div class="item blue">{item}</div>
  {/each}
</DynamicDragAndDropList>

<h2>Drag and drop horizontal</h2>
<DynamicDragAndDropList direction="x" bind:dragList={dragListVert}>
  {#each dragListVert as item}
    <div class="item red">{item}</div>
  {/each}
</DynamicDragAndDropList>

<h2>Drag and drop vertical</h2>
<DynamicDragAndDropList direction="y" bind:dragList={dragListHoriz}>
  {#each dragListHoriz as item}
    <div class="item green">{item}</div>
  {/each}
</DynamicDragAndDropList>

<style>
  .item {
    color: white;
    width: 200px;
    height: 200px;
    margin: 10px;
  }

  .blue {
    background-color: blue;
  }

  .red {
    background-color: red;
  }

  .green {
    background-color: green;
  }

  h2 {
    margin-top: 60px;
  }
</style>
