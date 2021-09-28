<script lang="ts">
  import { goto } from "$app/navigation";
  import { getStores } from "$app/stores";
  //import { page } from "$app/stores";

  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import ToggleButtons from "$lib/components/shared/ToggleButtons.svelte";
  import type { AccessPlatform, Session } from "$lib/types";
  import type { ImportStatus } from "@crkn-rcdr/access-data";

  export let results: ImportStatus[] = [];

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();
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
  let slugList: string[] = [];

  let lookupDone: boolean = false;

  function changeView(event) {
    lookupView = event.detail.option;
  }

  async function handleLookupPressedSlugList(event) {
    event.stopPropagation();
    slugList = slugListString.split(",");
    if (depositor.prefix !== "none")
      slugList = slugList.map((slug) => `${depositor.prefix}.${slug.trim()}`);
    else slugList = slugList;
    await sendLookupRequestKeys();
  }

  async function handleLookupPressedDates(event) {
    event.stopPropagation();
    await sendLookupRequestDates();
  }

  async function sendLookupRequestDates() {
    //goto(`/smelter/dates/${startDateStr},${endDateStr}`);
    console.log({
      from: startDateStr,
      to: endDateStr,
    });
    const response = await $session.lapin.query("dipstaging.listFromDates", {
      from: startDateStr,
      to: endDateStr,
    });
    if (response) results = response;
    lookupDone = true;
  }

  async function sendLookupRequestKeys() {
    //goto(`/smelter/keys/${keys.toString()}`);
    const response = await $session.lapin.query(
      "dipstaging.listFromKeys",
      keys
    );
    if (response) results = response;
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

  function resetLookupColor() {
    lookupDone = false;
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
