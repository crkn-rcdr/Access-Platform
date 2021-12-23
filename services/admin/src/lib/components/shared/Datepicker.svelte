<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import Flatpickr from "svelte-flatpickr";

  /**
   * @type { any } The selected start date to search for items from
   */
  export let options: any = { mode: "range" };

  /**
   * @type { string } The selected start date to search for items from
   */
  export let startDateStr: string = "";

  /**
   * @type { string } The selected end date to search for items to
   */
  export let endDateStr: string = "";

  /**
   * @type { string } The text to display on the input
   */
  export let placeholder: string = "";

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {HTMLSpanElement} The html element to attach the openseadragon viewer to.
   */
  let wrapper: HTMLSpanElement;

  let dateString;

  function handleDateRangeSelected(event: { detail: any }) {
    //console.log(event.detail);
    if (event.detail.length === 3) {
      const dates = event.detail[1].split(" to ");
      //console.log("dates", dates);
      if (dates.length === 2) {
        startDateStr = dates[0];
        endDateStr = dates[1];
        dispatch("changed", {
          startDateStr: startDateStr,
          endDateStr: endDateStr,
        });
      } else if (dates.length === 1) {
        startDateStr = dates[0];
        endDateStr = startDateStr;
        dispatch("changed", {
          startDateStr: startDateStr,
          endDateStr: endDateStr,
        });
      }
    }
  }

  onMount(() => {
    const inputs = wrapper.getElementsByClassName("flatpickr-input");
    if (inputs.length) {
      inputs[0]["placeholder"] = placeholder;
    }
  });

  $: {
    dateString =
      startDateStr.length && endDateStr.length
        ? `${startDateStr} to ${endDateStr}`
        : "";
  }
</script>

<span bind:this={wrapper}>
  <Flatpickr
    value={dateString}
    {options}
    on:change={handleDateRangeSelected}
    name="date"
  />
</span>
