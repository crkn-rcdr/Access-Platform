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

  export let size: "sm" | "lg" = "lg";

  /**
   * @type {number} The total number of items
   */
  export let count;

  /**
   * @type {number} The page number counting form zero
   */
  export let page = 1;

  /**
   * @type {number}  The number of items in the page
   */
  export let pageSize = 10;

  export let pageSizeEditable = true;

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
  function onChange(event, newPage) {
    page = newPage + 1;
    dispatch("change", {
      page,
      pageSize,
    });
  }

  /**
   * @listens count
   * @listens pageSize
   * @description Re-sets the page count when the count or page size change.
   */
  $: pageCount = Math.floor(count / pageSize);

  $: {
    if (size === "sm") {
      const numPages = Math.round(count / pageSize);
      buttons = [];
      for (let i = 0; i < numPages; i++) buttons.push(i);
    }
  }
</script>

<!--{page} * {pageSize} - {pageSize} + 1 = {page * pageSize - pageSize + 1}-->
{#if size === "sm"}
  {#if buttons.length}
    <button
      class="secondary"
      disabled={page === 1}
      on:click={(e) => onChange(e, page - 2)}
    >
      Prev
    </button>

    <select bind:value={page} on:change={(e) => onChange(e, page - 1)}>
      {#each buttons as pageNum}
        <option value={pageNum + 1}>
          {pageNum + 1}
        </option>
      {/each}
    </select>

    <button
      class="secondary"
      disabled={page > pageCount}
      on:click={(e) => onChange(e, page)}>Next</button
    >
  {/if}
{:else}
  <div>
    {#if pageSizeEditable}
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
    {/if}
    <ul>
      <li>
        <button
          class="pagin-lg"
          disabled={page === 1}
          on:click={(e) => onChange(e, 0)}
        >
          {labels.first}
        </button>
      </li>
      <li>
        <button
          class="pagin-lg"
          disabled={page === 1}
          on:click={(e) => onChange(e, page - 2)}
        >
          {labels.previous}
        </button>
      </li>
      {#each buttons as button}
        {#if page + button >= 0 && page + button <= pageCount}
          <li>
            <button
              class="pagin-lg"
              class:active={page === page + button + 1}
              on:click={(e) => onChange(e, page + button)}
            >
              {page + button + 1}
            </button>
          </li>
        {/if}
      {/each}
      <li>
        <button
          class="pagin-lg"
          disabled={page > pageCount}
          on:click={(e) => onChange(e, page)}
        >
          {labels.next}
        </button>
      </li>
      <li>
        <button
          class="pagin-lg"
          disabled={page > pageCount}
          on:click={(e) => onChange(e, pageCount)}
        >
          {labels.last}
        </button>
      </li>
      <br />
      <li class="count-message">
        Viewing items {page * pageSize - pageSize + 1} to {count <
        page * pageSize
          ? count
          : page * pageSize}
        of {count}.
      </li>
    </ul>
  </div>
{/if}

<style>
  .page-size {
    display: inline-block;
    margin-top: var(--margin-sm);
  }
  ul {
    flex: 1;
    float: right;
    list-style: none;
  }
  li {
    float: left;
  }
  button.pagin-lg {
    border: none;
    padding: 0.5rem 1em;
    margin-left: 3px;
    float: left;
    cursor: pointer;
    height: fit-content !important;
    filter: none;
  }
  .active {
    background-color: var(--primary-light) !important;
    color: var(--light-font);
  }
  .count-message {
    text-align: right;
    width: 100%;
    color: var(--secondary);
    padding: var(--perfect-fourth-8);
  }
</style>
