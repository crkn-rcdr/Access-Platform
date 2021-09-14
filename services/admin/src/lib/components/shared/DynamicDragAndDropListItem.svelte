<script lang="ts">
  export let pos: number;
  let container: HTMLDivElement;

  $: if (container && typeof pos !== "undefined")
    container.setAttribute("data-i", `${pos - 1}`);
</script>

<div bind:this={container} class="drop-list-item">
  <slot />
</div>
