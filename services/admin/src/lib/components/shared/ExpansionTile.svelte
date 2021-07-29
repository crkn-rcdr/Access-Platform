<script lang="ts">
  import FaAngleDown from "svelte-icons/fa/FaAngleDown.svelte";
  import FaInfoCircle from "svelte-icons/fa/FaInfoCircle.svelte";
  import FaAngleUp from "svelte-icons/fa/FaAngleUp.svelte";
  export let useInfoIcon = false;
  let toggled = false;
</script>

<div>
  <div>
    <slot name="top" />
    {#if !toggled}
      <div
        class="icon"
        on:click={() => {
          toggled = true;
        }}
      >
        {#if useInfoIcon}
          <FaInfoCircle />
        {:else}
          <FaAngleDown />
        {/if}
      </div>
    {:else}
      <div
        class="icon"
        on:click={() => {
          toggled = false;
        }}
      >
        <FaAngleUp />
      </div>
    {/if}
  </div>
  {#if toggled}
    <div>
      <slot name="bottom" />
    </div>
  {/if}
</div>

<style>
  .icon {
    float: right;
    margin: 0 0.5rem;
  }
</style>
