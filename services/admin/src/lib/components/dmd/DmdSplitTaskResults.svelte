<!--
@component
### Overview
This componenet displays the results (if available) of the splitting (creating of XML/json files per each item in the metadata file) and allows the user to confirm if they would like to store the results in access and or preservation per each item.

### Properties
|    |    |    |
| -- | -- | -- |
| depositorPrefix: string or undefined   | optional | The depositor prefix string for the repository the objects gaining metadata are found in. |
| metadataType: string or undefined    | optional | Used to tell the dmdtask deamons what kind of metadata format the metadata being processed is in. |
| dmdTask: DMDTask or undefined | optional | The DMD task for which results are being displayed.
### Usage
```  
<DmdSplitTaskResults
  bind:depositorPrefix
  bind:metadataType
  bind:dmdTask
  on:continue={() => {
    ...do something
  }}
  on:cancel={() => {
    ...do something else
  }}
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import { createEventDispatcher } from "svelte";

  /**
   * @type {string | undefined} The depositor prefix string for the repository the objects gaining metadata are found in.
   */
  export let depositorPrefix: string | undefined = undefined;

  /**
   * @type {string | undefined} Used to tell the dmdtask deamons what kind of metadata format the metadata being processed is in.
   */
  export let metadataType: string | undefined = undefined;

  /**
   * @type { DMDTask | undefined } The DMD task for which results are being displayed.
### Usage
   */
  export let dmdTask: DMDTask = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Triggers @event store to tell the parent component that the user wants to go through with the task.
   * @param event
   * @returns void
   */
  function handleContinue(event: any) {
    dispatch("continue", event);
  }

  /**
   * Triggers @event cancel to tell the parent component that the user does not want to go through with the task.
   * @param event
   * @returns void
   */
  function handleCancel(event: any) {
    dispatch("cancel", event);
  }
</script>

<div class="split-task-result">
  {#if dmdTask["split"]}
    <!--TODO: slug information-->
    <!--label for="valid-slugs"><b>Slugs</b></label>
  <br />
  <NotificationBar
    status="fail"
    message="An invalid slug was removed from the list: oe3iu48rwdheks"
  />
  <textarea name="valid-slugs" value="oochim.12345, oochim.242445" />
  <br />
  <br /-->
    <table>
      {#if "succeeded" in dmdTask["split"]}
        <tr>
          <td><b>Success?</b></td>
          <td>{dmdTask["split"]["succeeded"] ? "Yes" : "No"}</td>
        </tr>
      {/if}
      {#if "message" in dmdTask["split"]}
        <tr>
          <td><b>Message</b></td>
          <td>{dmdTask["split"]["message"]}</td>
        </tr>
      {/if}
      {#if "requestDate" in dmdTask["split"]}
        <tr>
          <td><b>Request Date</b></td>
          <td>{dmdTask["split"]["requestDate"]}</td>
        </tr>
      {/if}
      {#if "processDate" in dmdTask["split"]}
        <tr>
          <td><b>Process Date</b></td>
          <td>{dmdTask["split"]["processDate"]}</td>
        </tr>
      {/if}
      {#if dmdTask?.["attachments"]?.["metadata"]?.["revpos"]}
        <tr>
          <td><b>Revision</b></td>
          <td>{dmdTask["attachments"]["metadata"]["revpos"]}</td>
        </tr>
      {/if}
      {#if depositorPrefix}
        <tr>
          <td><b>Depositor</b></td>
          <td>{depositorPrefix}</td>
        </tr>
      {/if}
      {#if metadataType}
        <tr>
          <td><b>Metadata type</b></td>
          <td>{metadataType}</td>
        </tr>
      {/if}
    </table>
  {/if}
  <br />
  {#if dmdTask["items"]}
    <table>
      <caption><b>Metadata records found</b></caption>
      {#each dmdTask["items"] as item}
        <tr>
          <td>{item?.["id"] ? item["id"] : "No id"}</td>
          <td class="message"
            >{item?.["splitResult"]?.["message"]
              ? item["splitResult"]["message"]
              : "No message"}</td
          >
          <td>
            {item?.["splitResult"]?.["accessSlug"]
              ? item["splitResult"]["accessSlug"]
              : "No access slug"}
          </td>
          <td>{item?.["splitResult"]?.["valid"] ? "Yes" : "No"}</td>
          <td
            >{item?.["splitResult"]?.["preservationId"]
              ? item["splitResult"]["preservationId"]
              : "No preservation id"}</td
          >
          <td class="auto-align auto-align__a-center"
            >Store in access? <input type="checkbox" /></td
          >
          <td class="auto-align auto-align__a-center"
            >Store in preservation? <input type="checkbox" /></td
          >
        </tr>
      {/each}
    </table>
  {/if}
  <br />
  <button class="button primary" type="submit" on:click={handleContinue}>
    Store Results
  </button>

  <button class="button secondary" type="submit" on:click={handleCancel}>
    Try Again
  </button>
</div>

<style>
  .split-task-result {
    min-height: 50rem;
  }
</style>
