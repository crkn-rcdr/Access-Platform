<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let selectable = false;
  export let selected = false;
  export let disabled = false;
  export let name = "";
  export let imgURL = "";
  export let imgAlt = "";
  const dispatch = createEventDispatcher();

  function handleClick() {
    if (!selected && disabled) return;
    selected = true;
    dispatch("clicked", { selected });
  }
</script>

<div class="card shadow">
  <label
    for={name}
    class="card-content-wrap"
    class:disabled={disabled && !selected}
  >
    {#if selectable && name.length}
      <input
        type="checkbox"
        {name}
        id={name}
        disabled={disabled && !selected}
      />
    {/if}
    <div class="content" class:selectable={name.length} on:click={handleClick}>
      {#if imgURL.length}
        <img src={imgURL} alt={imgAlt} />
      {/if}
      <span class="checkmark" />
      <slot />
    </div>
  </label>
</div>

<style>
  .card {
    display: inline-block;
    position: relative;
    margin: 0;
  }
  .selectable {
    cursor: pointer;
  }
  .content {
    display: grid;
    position: relative;
    margin: 0;
    text-align: center;
    box-shadow: var(--shadow);
    background: var(--base-bg);
    border-radius: var(--border-radius);
    width: 100%;
    height: 100%;
    padding: 1rem;
    grid-gap: 1rem;
    place-content: center;
    transition: 0.3s ease-in-out all;
  }

  .content img {
    width: 80%;
    margin: 0 auto;
  }

  .card-content-wrap {
    position: relative;
  }

  .card-content-wrap input {
    display: none;
  }

  .card-content-wrap .checkmark {
    position: absolute;
    width: var(--perfect-fourth-6);
    height: var(--perfect-fourth-6);
    border: solid 0.025rem var(--border-color);
    border-radius: 50%;
    top: 1rem;
    left: 1rem;
    transition: 0.3s ease-in-out all;
    z-index: 1;
  }

  .card-content-wrap input:checked + .content .checkmark {
    display: inline-block;
    background: var(--primary);
    border-radius: 50%;
    border: none;
    transform: rotate(45deg);
  }

  .card-content-wrap input:checked + .content .checkmark:before {
    content: "";
    position: absolute;
    width: 0.2rem;
    height: 0.8rem;
    background-color: #fff;
    left: 0.8rem;
    top: 0.3rem;
  }

  .card-content-wrap input:checked + .content .checkmark:after {
    content: "";
    position: absolute;
    width: 0.5rem;
    height: 0.2rem;
    background-color: #fff;
    left: 0.5rem;
    top: 1rem;
  }

  .card-content-wrap.disabled input,
  .card-content-wrap.disabled .checkmark,
  .card-content-wrap.disabled .checkmark:before,
  .card-content-wrap.disabled .checkmark:after {
    display: none;
  }

  .card-content-wrap.disabled .selectable {
    cursor: initial;
  }
</style>
