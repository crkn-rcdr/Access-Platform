<!--
@component
### Overview
This component allows the user to find packages in the dipstaging database.

### Properties
|    |    |    |
| -- | -- | -- |
| results: ImportStatus[] | required | The packages to display |

### Usage
```
<DipstagingLookup bind:results />
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  import { getStores } from "$app/stores";
  import ToggleButtons from "$lib/components/shared/ToggleButtons.svelte";
  import type { Session } from "$lib/types";
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import LoadingButton from "$lib/components/shared/LoadingButton.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Datepicker from "$lib/components/shared/Datepicker.svelte";
  import { onMount } from "svelte";
  import PrefixSlugSearchBox from "$lib/components/access-objects/PrefixSlugSearchBox.svelte";

  /**
   * @type {ImportStatus[]}
   * The packages in the format of ImportStatus, to be displayed to the user/
   */
  export let results: ImportStatus[] | undefined;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type { string } The label for the by-slug toggle
   */
  const BY_SLUG_LABEL = "Look-up by AIP ID";

  /**
   * @type { string } The label for the by-date toggle
   */
  const BY_DATE_LABEL = "Look-up by Date";

  /**
   * @type { string } The selected lookup method
   */
  let lookupView: string = BY_DATE_LABEL;

  /**
   * @type { string } The selected start date to search for items from
   */
  let startDateStr: string = "";

  /**
   * @type { string } The selected end date to search for items to
   */
  let endDateStr: string = "";

  /**
   * @type { string } The array of slugs
   */
  let slugList: string[] = [];

  /**
   * @type { boolean } If the lookup has completed run once yet.
   */
  let lookupDone: boolean = false;

  /**
   * @type { boolean } If the lookup has completed or not.
   */
  let loading: boolean = false;

  /**
   * @type { string } Used to diaplay any errors from the backend to the user.
   */
  let error = "";

  /**
   * Sets the @var lookupView when the toggle buttons are clicked
   * @returns void
   */
  function changeView(event) {
    lookupView = event.detail.option;
  }

  /**
   * Stops the event propogation of the button press then calls @function handleLookupPressedSlugList
   * @returns void
   */
  async function handleLookupPressedSlugList(event) {
    event.stopPropagation();
    await sendLookupRequestAIPIds();
  }

  /**
   * Stops the event propogation of the button press then calls @function handleLookupPressedDates
   * @returns void
   */
  async function handleLookupPressedDates(event) {
    event.stopPropagation();
    await sendLookupRequestDates();
  }

  /**
   * Sends the request to look up the items by date to the backend and saves the results
   * @returns void
   */
  async function sendLookupRequestDates() {
    if (loading) return;
    loading = true;
    error = "";
    if (startDateStr?.length) {
      if (!endDateStr?.length) endDateStr = startDateStr;
      try {
        const response = await $session.lapin.query(
          "dipstaging.listFromDates",
          {
            from: startDateStr,
            to: endDateStr,
          }
        );
        if (response) results = response;
      } catch (e) {
        error = e?.message.includes(`"path:"`)
          ? "Code 3. Please contact the platform team for assistance."
          : "Code 4. Please contact the platform team for assistance.";
      }
      lookupDone = true;
    }
    loading = false;
  }

  /**
   * Sends the request to look up the items by slug to the backend and saves the results
   * @returns void
   */
  async function sendLookupRequestAIPIds() {
    if (loading) return;
    if (!slugList.length) return;
    loading = true;

    try {
      const response = await $session.lapin.mutation(
        "dipstaging.listFromKeys",
        slugList
      );
      if (response) results = response;
    } catch (e) {
      error = e?.message.includes(`"path:"`)
        ? "Code 1. Please contact the platform team for assistance."
        : "Code 2. Please contact the platform team for assistance.";
    }

    lookupDone = true;
    loading = false;
  }

  onMount(async () => {
    // if not searched then set default
    if (startDateStr === "" && endDateStr === "") {
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDateStr = startDate.toISOString().split("T")[0];
      //let endDate = new Date();
      endDateStr = startDateStr; //endDate.toISOString().split("T")[0];
      //await sendLookupRequestDates();
    }
  });
</script>

<ToggleButtons
  activeIndex={lookupView === BY_SLUG_LABEL ? 1 : 0}
  color={lookupDone ? "secondary" : "primary"}
  options={[BY_DATE_LABEL, BY_SLUG_LABEL]}
  on:select={changeView}
/>
<br />
<br />

<div class="lookup-wrap auto-align">
  <div class="user-input">
    {#if lookupView === BY_SLUG_LABEL}
      <div class="extra-spacing">
        <!--PrefixSelector bind:depositor />
        <textarea
          rows="16"
          placeholder="Enter a list of slugs seperated by commas or new lines."
          bind:value={slugListString}
        /-->
        <PrefixSlugSearchBox
          label={"AIP ids"}
          on:slugs={(event) => {
            slugList = event.detail;
          }}
        />
        <br />
        <br />
      </div>
    {:else}
      <!--label for="start">Start date:</label><br />
      <input
        type="date"
        id="start"
        name="trip-start"
        bind:value={startDateStr}
      /><br /><br />

      <label for="end">End date:</label><br />
      <input type="date" id="end" name="trip-end" bind:value={endDateStr} /-->

      <span class="flatpickr-date-filter-label">Select date(s):</span>
      <br />
      <Datepicker
        placeholder="Select date(s)"
        bind:startDateStr
        bind:endDateStr
        options={{ mode: "range" }}
      />
      <br />
      <br />
    {/if}
  </div>
</div>

<NotificationBar message={error} status="fail" />
<br />

<div class="extra-spacing">
  <span class="lookup-button">
    {#if lookupView === BY_SLUG_LABEL}
      <LoadingButton
        buttonClass={lookupDone ? "secondary" : "primary"}
        on:clicked={handleLookupPressedSlugList}
        showLoader={loading}
        disabled={slugList.length === 0}
      >
        <span slot="content"> Look-up Packages </span>
      </LoadingButton>
    {:else if lookupView === BY_DATE_LABEL}
      <LoadingButton
        buttonClass={lookupDone ? "secondary" : "primary"}
        on:clicked={handleLookupPressedDates}
        showLoader={loading}
        disabled={!startDateStr.length || !endDateStr.length}
      >
        <span slot="content"> Look-up Packages </span>
      </LoadingButton>
    {/if}
  </span>
</div>

<style>
  .lookup-wrap {
    height: 100%;
    width: 30.5rem;
  }
  .user-input {
    flex: 9;
  }
  .extra-spacing {
    width: 100%;
  }
  .lookup-button {
    float: right;
  }
  :global(.user-input input) {
    width: 100%;
  }
</style>
