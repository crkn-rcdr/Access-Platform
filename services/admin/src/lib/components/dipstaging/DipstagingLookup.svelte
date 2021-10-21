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
  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import ToggleButtons from "$lib/components/shared/ToggleButtons.svelte";
  import type { Depositor, Session } from "$lib/types";
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import LoadingButton from "$lib/components/shared/LoadingButton.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";

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
   * @type { Depositor } The access platform to look for the items in.
   */
  let depositor: Depositor | null = {
    prefix: "none",
    label: "",
  };

  /**
   * @type { string } The label for the by-slug toggle
   */
  const BY_SLUG_LABEL = "Look-up by Slug";

  /**
   * @type { string } The label for the by-date toggle
   */
  const BY_DATE_LABEL = "Look-up by Date";

  /**
   * @type { string } The selected lookup method
   */
  let lookupView: string = BY_SLUG_LABEL;

  /**
   * @type { string } The selected start date to search for items from
   */
  let startDateStr: string = "";

  /**
   * @type { string } The selected end date to search for items to
   */
  let endDateStr: string = "";

  /**
   * @type { string } The value of the text input where users can enter slugs
   */
  let slugListString: string = "";

  /**
   * @type { string } The array of slugs derived from @var slugListString
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
    await sendLookupRequestKeys();
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
    loading = true;
    error = "";
    if (startDateStr?.length && endDateStr?.length) {
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
        error = "There was a problem with your search. Please try again.";
      }
      lookupDone = true;
    }
    loading = false;
  }

  /**
   * Sends the request to look up the items by slug to the backend and saves the results
   * @returns void
   */
  async function sendLookupRequestKeys() {
    loading = true;
    if (slugList.includes(",")) slugList = slugListString.split(",");
    else slugList = slugListString.split("\n");
    slugList = slugList.filter((slug) => slug.trim().length);
    if (slugList.length) {
      if (depositor?.prefix !== "none")
        slugList = slugList.map(
          (slug) => `${depositor?.prefix}.${slug.trim()}`
        );
      else slugList = slugList.map((slug) => slug.trim());
      const response = await $session.lapin.query(
        "dipstaging.listFromKeys",
        slugList
      );
      if (response) results = response;
      lookupDone = true;
    }
    loading = false;
  }
</script>

<ToggleButtons
  activeIndex={lookupView === BY_SLUG_LABEL ? 0 : 1}
  color={lookupDone ? "secondary" : "primary"}
  options={[BY_SLUG_LABEL, BY_DATE_LABEL]}
  on:select={changeView}
/>
<br />
<br />

<div class="lookup-wrap auto-align">
  <div class="user-input">
    {#if lookupView === BY_SLUG_LABEL}
      <div class="extra-spacing">
        <PrefixSelector bind:depositor />
        <textarea
          rows="16"
          placeholder="Enter a list of slugs seperated by commas or new lines."
          bind:value={slugListString}
        />
        <br />
        <br />
      </div>
    {:else}
      <label for="start">Start date:</label><br />
      <input
        type="date"
        id="start"
        name="trip-start"
        bind:value={startDateStr}
      /><br /><br />

      <label for="end">End date:</label><br />
      <input type="date" id="end" name="trip-end" bind:value={endDateStr} /><br
      /><br />
    {/if}
  </div>
</div>

<div class="extra-spacing">
  <span class="lookup-button">
    {#if lookupView === BY_SLUG_LABEL}
      <LoadingButton
        buttonClass={lookupDone ? "secondary" : "primary"}
        on:clicked={handleLookupPressedSlugList}
        showLoader={loading}
        disabled={slugListString.length === 0}
      >
        <span slot="content">
          {lookupDone ? "Look-up Packages Again" : "Look-up Packages"}
        </span>
      </LoadingButton>
    {:else if lookupView === BY_DATE_LABEL}
      <LoadingButton
        buttonClass={lookupDone ? "secondary" : "primary"}
        on:clicked={handleLookupPressedDates}
        showLoader={loading}
        disabled={!(depositor && startDateStr.length && endDateStr.length)}
      >
        <span slot="content">
          {lookupDone ? "Look-up Packages Again" : "Look-up Packages"}
        </span>
      </LoadingButton>
    {/if}
  </span>
</div>

<NotificationBar message={error} status="fail" />

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
  textarea {
    width: 100%;
  }
  .lookup-button {
    float: right;
  }
  input {
    width: 100%;
  }
</style>
