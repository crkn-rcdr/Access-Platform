<script lang="ts">
  import DynamicDragAndDropList from "../components/shared/DynamicDragAndDropList.svelte";
  let dragListGrid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let dragListVert = [1, 2, 3, 4, 5, 6];
  let dragListHoriz = [1, 2, 3, 4, 5];
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<DynamicDragAndDropList direction="both" bind:dragList={dragListGrid}>
  {#each dragListGrid as item}
    <div class="item blue">{item}</div>
  {/each}
</DynamicDragAndDropList>

<br />
<br />

<DynamicDragAndDropList direction="x" bind:dragList={dragListVert}>
  {#each dragListVert as item}
    <div class="item red">{item}</div>
  {/each}
</DynamicDragAndDropList>

<br />
<br />

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
</style>
