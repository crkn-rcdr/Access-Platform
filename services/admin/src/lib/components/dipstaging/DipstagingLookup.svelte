<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import ToggleButtons from "$lib/components/shared/ToggleButtons.svelte";
  import type { AccessPlatform } from "$lib/types";

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  let depositor: AccessPlatform = {
    prefix: "none",
    label: "",
  };
  const BY_SLUG_LABEL = "Search by Slug";
  const BY_DATE_LABEL = "Search by Date";
  let lookupView: string = BY_SLUG_LABEL;

  let startDateStr: string;
  let endDateStr: string;
  let slugListString: string;

  let lookupDone: boolean = false;

  function changeView(event) {
    lookupView = event.detail.option;
  }

  function handleLookupPressedSlugList(event) {
    event.stopPropagation();
    let slugList: string[] = slugListString.split(",");

    if (depositor.prefix !== "none")
      slugList = slugList.map((slug) =>
        encodeURIComponent(
          encodeURIComponent(`${depositor.prefix}.${slug.trim()}`)
        )
      );
    else
      slugList = slugList.map((slug) =>
        encodeURIComponent(encodeURIComponent(slug.trim()))
      );
    goto(`/smelter/keys/${slugList.toString()}`);
    lookupDone = true;
  }

  function handleLookupPressedDates(event) {
    event.stopPropagation();
    goto(`/smelter/dates/${startDateStr},${endDateStr}`);
    lookupDone = true;
  }

  function reset() {
    depositor = {
      prefix: "none",
      label: "",
    };
    lookupView = BY_SLUG_LABEL;
    lookupDone = false;
    startDateStr = "";
    endDateStr = "";
    slugListString = "";
  }

  function setDateDefaults(dates: string[]) {
    if (dates && dates.length === 2) {
      lookupView = BY_DATE_LABEL;
      startDateStr = dates[0];
      endDateStr = dates[1];
      lookupDone = true;
    } else {
      reset();
    }
  }

  function setSlugDefaults(keys: string[]) {
    if (keys && keys.length) {
      lookupView = BY_SLUG_LABEL;
      lookupDone = true;
      slugListString = keys
        .map((prefixedSlug) => {
          prefixedSlug = decodeURIComponent(decodeURIComponent(prefixedSlug));
          const arr = prefixedSlug.split(".");
          if (arr.length > 1) {
            depositor.prefix = arr[0];
            return arr.slice(1);
          } else return prefixedSlug;
        })
        .toString();
    } else {
      reset();
    }
  }

  function setDefaults(params) {
    if (params?.dates) setDateDefaults(params.dates.split(","));
    else if (params?.keys)
      setSlugDefaults(
        params.keys
          .split(",")
          .map((key) => encodeURIComponent(encodeURIComponent(key)))
      );
    else reset();
  }

  function resetLookupColor() {
    lookupDone = false;
  }

  $: setDefaults($page.params);
</script>

<div on:click={resetLookupColor}>
  <br />
  <ToggleButtons
    activeIndex={lookupView === BY_SLUG_LABEL ? 0 : 1}
    color={lookupDone ? "secondary" : "primary"}
    options={[BY_SLUG_LABEL, BY_DATE_LABEL]}
    on:select={changeView}
  /><br />
  <br />

  <div class="lookup-wrap auto-align">
    <div class="user-input">
      {#if lookupView === "Search by Slug"}
        <div class="list-search">
          <PrefixSelector bind:depositor />
          <textarea
            placeholder="Type a comma-seperated list of slugs"
            bind:value={slugListString}
          />
        </div>
      {:else}
        <label for="start">Start date:</label>
        <input
          type="date"
          id="start"
          name="trip-start"
          bind:value={startDateStr}
        />

        <label for="end">End date:</label>
        <input
          type="date"
          id="end"
          name="trip-end"
          bind:value={endDateStr}
        /><br />
      {/if}
    </div>
  </div>

  <br />
  <br />
  {#if lookupView === BY_SLUG_LABEL && slugListString?.length}
    <button
      class:primary={!lookupDone}
      class:secondary={lookupDone}
      on:click={handleLookupPressedSlugList}
    >
      {lookupDone ? "Lookup Again" : "Lookup"}
    </button>
  {:else if lookupView === BY_DATE_LABEL && startDateStr?.length && endDateStr?.length}
    <button
      class:primary={!lookupDone}
      class:secondary={lookupDone}
      on:click={handleLookupPressedDates}
    >
      {lookupDone ? "Lookup Again" : "Lookup"}
    </button>
  {/if}
</div>

<style>
  .lookup-wrap {
    width: 100%;
  }
  .user-input {
    flex: 9;
  }
  .list-search {
    width: 95%;
  }
  textarea {
    width: 100%;
  }
</style>
