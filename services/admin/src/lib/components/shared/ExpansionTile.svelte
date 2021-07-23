<script lang="ts">
  import FaAngleDown from "svelte-icons/fa/FaAngleDown.svelte";
  import FaAngleUp from "svelte-icons/fa/FaAngleUp.svelte";
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
        <FaAngleDown />
      </div>
    {/if}
  </div>
  {#if toggled}
    <div>
      <slot name="bottom" />
      <div
        class="icon"
        on:click={() => {
          toggled = false;
        }}
      >
        <FaAngleUp />
      </div>
    </div>
  {/if}
</div>

<style>
  .icon {
    float: right;
  }
</style>
