<script lang="ts">
  import { goto } from "$app/navigation";
  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import ToggleButtons from "$lib/components/shared/ToggleButtons.svelte";
  import type { AccessPlatform } from "$lib/types";

  export let keys: string[] = [];
  export let dates: string[] = [];

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  let depositor: AccessPlatform = {
    prefix: "none",
    label: "",
  };
  const BY_SLUG_LABEL = "Look-up by Slug";
  const BY_DATE_LABEL = "Look-up by Date";
  let lookupView: string = BY_SLUG_LABEL;

  let startDateStr: string;
  let endDateStr: string;
  let slugListString: string;

  let lookupDone: boolean = false;

  function changeView(event) {
    lookupView = event.detail.option;
  }

  async function handleLookupPressedSlugList(event) {
    event.stopPropagation();
    let slugList: string[] = slugListString.split(",");
    if (depositor.prefix !== "none")
      keys = slugList.map((slug) => `${depositor.prefix}.${slug.trim()}`);
    else keys = slugList;
    await sendLookupRequestKeys();
  }

  async function handleLookupPressedDates(event) {
    event.stopPropagation();
    await sendLookupRequestDates();
  }

  async function sendLookupRequestDates() {
    goto(`/smelter/dates/${startDateStr},${endDateStr}`);
    lookupDone = true;
  }

  async function sendLookupRequestKeys() {
    goto(`/smelter/keys/${keys.toString()}`);
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

  function resetLookupColor() {
    lookupDone = false;
  }

  $: {
    console.log(keys);
    if (keys)
      setSlugDefaults(
        keys.map((key) => encodeURIComponent(encodeURIComponent(key)))
      );
  }

  $: {
    console.log(dates);
    if (dates) setDateDefaults(dates);
  }
</script>

<br />
<ToggleButtons
  activeIndex={lookupView === BY_SLUG_LABEL ? 0 : 1}
  color={lookupDone ? "secondary" : "primary"}
  options={[BY_SLUG_LABEL, BY_DATE_LABEL]}
  on:select={changeView}
/><br />
<br />

<div class="lookup-wrap auto-align" on:click={resetLookupColor}>
  <div class="user-input">
    {#if lookupView === BY_SLUG_LABEL}
      <div class="extra-spacing">
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
      <input type="date" id="end" name="trip-end" bind:value={endDateStr} /><br
      />
    {/if}
  </div>
</div>

<div class="extra-spacing">
  {#if lookupView === BY_SLUG_LABEL && slugListString?.length}
    <br />
    <button
      class:primary={!lookupDone}
      class:secondary={lookupDone}
      on:click={handleLookupPressedSlugList}
    >
      {lookupDone ? "Look-up Packages Again" : "Look-up Packages"}
    </button>
  {:else if lookupView === BY_DATE_LABEL && startDateStr?.length && endDateStr?.length}
    <button
      class:primary={!lookupDone}
      class:secondary={lookupDone}
      on:click={handleLookupPressedDates}
    >
      {lookupDone ? "Look-up Packages Again" : "Look-up Packages"}
    </button>
    <br />
    <br />
  {/if}
</div>

<style>
  .lookup-wrap {
    width: 100%;
  }
  .user-input {
    flex: 9;
  }
  .extra-spacing {
    width: 95%;
  }
  textarea {
    width: 100%;
  }

  button {
    float: right;
  }
</style>
