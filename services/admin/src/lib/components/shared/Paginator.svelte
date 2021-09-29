<script>
  import { createEventDispatcher, getContext } from "svelte";
  const dispatch = createEventDispatcher();
  const stateContext = getContext("state");

  export let buttons = [-2, -1, 0, 1, 2];
  export let count;
  export let page = 0;
  export let pageSize;

  export let labels = {
    first: "First",
    last: "Last",
    next: "Next",
    previous: "Previous",
  };

  $: pageCount = Math.floor(count / pageSize);

  function onChange(event, page) {
    dispatch("pageChange", page + 1);
  }
</script>

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
    {#if page + button >= 0 && page + button < pageCount}
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
</ul>

<style>
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
    border: 1px solid var(--border-color);
    padding: 0.5rem 1em;
    margin-left: 3px;
    float: left;
    cursor: pointer;
    height: fit-content !important;
    filter: none;
  }
</style>
