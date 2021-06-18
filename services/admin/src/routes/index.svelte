<script lang="ts">
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  let dragListGrid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let dragListVert = [1, 2, 3, 4, 5, 6];
  let dragListHoriz = [1, 2, 3, 4, 5];
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<br />
<hr />
<p>boop.</p>
<p class="margin-top-sm">I have the smallest margin</p>
<p class="margin-top-md">I have the middle margin</p>
<p class="margin-top-lg">I have the largest margin</p>
<hr />
<br />

<h6>Drag and drop grid</h6>
<DynamicDragAndDropList direction="both" bind:dragList={dragListGrid}>
  {#each dragListGrid as item}
    <div class="item blue">{item}</div>
  {/each}
</DynamicDragAndDropList>

<br />
<br />

<h6>Drag and drop horizontal</h6>
<DynamicDragAndDropList direction="x" bind:dragList={dragListVert}>
  {#each dragListVert as item}
    <div class="item red">{item}</div>
  {/each}
</DynamicDragAndDropList>

<br />
<br />

<h6>Drag and drop vertical</h6>
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
