<!--
@component
### Overview
A card component that optionally allows for user selection

### Properties
|    |    |    |
| -- | -- | -- |
| page : number  | required | The page number counting form zero |
| count : number  | required | The total number of items |
| pageSize : number  | optional | The number of items in the page |

### Usage
```  
<Paginator
    page={pageNumber - 1}
    {count}
    on:pageChange={handlePageChangePressed}
  />
```
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * @type {number} The total number of items
   */
  export let count;

  /**
   * @type {number} The page number counting form zero
   */
  export let page = 0;

  /**
   * @type {number}  The number of items in the page
   */
  export let pageSize = 10;

  /**
   * @type {number[]} A model for the visible buttons
   */
  let buttons = [-2, -1, 0, 1, 2];

  /**
   * @type {any} A model for the visible buttons labels
   */
  let labels = {
    first: "First",
    last: "Last",
    next: "Next",
    previous: "Previous",
  };

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Dispatches the pageChange event
   * @returns void
   */
  function onChange(event, page) {
    dispatch("change", {
      page: page + 1,
      pageSize,
    });
  }

  /**
   * @listens count
   * @listens pageSize
   * @description Re-sets the page count when the count or page size change.
   */
  $: pageCount = Math.floor(count / pageSize);
</script>

<span class="page-size">
  <label for="page-size">Items per page:</label>
  <select
    name="page-size"
    bind:value={pageSize}
    on:change={(e) => onChange(e, page)}
  >
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={30}>30</option>
    <option value={40}>40</option>
    <option value={50}>50</option>
    <option value={100}>100</option>
  </select>
</span>
<ul>
  <li>
    <button disabled={page === 0} on:click={(e) => onChange(e, 0)}>
      {labels.first}
    </button>
  </li>
  <li>
    <button disabled={page === 0} on:click={(e) => onChange(e, page - 1)}>
      {labels.previous}
    </button>
  </li>
  {#each buttons as button}
    {#if page + button >= 0 && page + button <= pageCount}
      <li>
        <button
          class:active={page === page + button}
          on:click={(e) => onChange(e, page + button)}
        >
          {page + button + 1}
        </button>
      </li>
    {/if}
  {/each}
  <li>
    <button
      disabled={page > pageCount - 1}
      on:click={(e) => onChange(e, page + 1)}
    >
      {labels.next}
    </button>
  </li>
  <li>
    <button
      disabled={page >= pageCount}
      on:click={(e) => onChange(e, pageCount)}
    >
      {labels.last}
    </button>
  </li>
  <br />
  <li class="count-message">
    Viewing items {(page + 1) * pageSize - pageSize + 1} to {count <
    (page + 1) * pageSize
      ? count
      : (page + 1) * pageSize}
    of {count}.
  </li>
</ul>

<style>
  .page-size {
    display: inline-block;
    margin-top: var(--margin-sm);
  }
  .active {
    background-color: var(--primary-light);
  }
  ul {
    flex: 1;
    float: right;
    list-style: none;
  }
  li {
    float: left;
  }
  button {
    background: transparent;
    border: none;
    padding: 0.5rem 1em;
    margin-left: 3px;
    float: left;
    cursor: pointer;
    height: fit-content !important;
    filter: none;
  }
  .count-message {
    text-align: right;
    width: 100%;
    color: var(--secondary);
    padding: var(--perfect-fourth-8);
  }
</style>
