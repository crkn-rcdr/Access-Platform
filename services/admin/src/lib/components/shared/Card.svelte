<!--
@component
### Overview
A card component that optionally allows for user selection

### Properties
|    |    |    |
| -- | -- | -- |
| selectable : boolean  | optional | If the card should be selectable |
| selected : boolean    | optional | If the card is selected by default |
| imgURL : string       | optional | An image to display in the card |
| imgAlt : string       | optional | The alternative text for the image displayed in the card |

### Usage
```  
<Card
    on:clicked={(event) => {console.logs(event.detail)}}
    selectable={true}
    {selected}
    imgURL={`default.jpg`}
  >
  ...content
</Card>
```
-->
<script lang="ts">
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import { createEventDispatcher } from "svelte";

  /**
   * @type {boolean} If the card should be selectable.
   */
  export let selectable = false;

  /**
   * @type {boolean} If the card is selected by default.
   */
  export let selected = false;

  /**
   * @type {string} An image to display in the card.
   */
  export let imgURL = "";

  /**
   * @type {string} The alternative text for the image displayed in the card.
   */
  export let imgAlt = "";

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Changes the checkbox on the cards state, and then lets parent's know the card was clicked though the @event clicked, with the selected status in the event.detail
   * @returns void
   */
  function handleClick() {
    selected = !selected;
    dispatch("clicked", { selected });
  }
</script>

<div class="card shadow" class:selected>
  <div class="card-select" on:click={handleClick}>
    <div class="card-content-wrap" class:selectable>
      <div
        class="card-actions auto-align auto-align__column auto-align__a-center"
      >
        {#if selectable}
          <div class="checkmark" class:deselected={!selected}>
            <FaCheck />
          </div>
        {/if}
        <div on:click={(e) => e.preventDefault()}>
          <slot name="action" />
        </div>
      </div>

      <div class="card-content">
        {#if imgURL.length}
          <img src={imgURL} alt={imgAlt} />
        {/if}

        <div class="card-body">
          <slot />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .card {
    display: inline-block;
    position: relative;
    margin: 0;
    box-shadow: var(--shadow);
    background: var(--base-bg);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .card.selected {
    background: var(--teal-light);
    border: 1px solid var(--teal);
  }

  .selectable {
    cursor: pointer;
  }

  .card-select {
    width: 100%;
    height: 100%;
  }

  .card-select,
  .card-content-wrap,
  .card-content {
    position: relative;
  }

  .card-content-wrap {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 4fr;
    position: relative;
    margin: 0;
    transition: 0.3s ease-in-out all;
    overflow: hidden;
  }

  .checkmark {
    width: var(--perfect-fourth-5);
    height: var(--perfect-fourth-5);
    color: var(--light-font);
    background-color: var(--teal);
    border: solid 0.15rem var(--teal);
    border-radius: var(--border-radius);
    padding: 0.21rem;
  }

  .checkmark.deselected {
    border: solid 0.15rem var(--border-color);
    background: var(--base-bg);
  }

  .card-select.disabled .selectable {
    cursor: initial;
  }

  :global(.checkmark.deselected svg) {
    display: none;
  }

  .card-actions > * {
    margin-top: 1rem;
  }
  .card-actions > *:hover {
    filter: brightness(1.1);
  }

  .card-content img {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    background-color: var(--grey);
  }
</style>
