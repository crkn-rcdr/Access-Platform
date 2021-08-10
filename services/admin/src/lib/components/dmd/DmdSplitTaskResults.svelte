<script lang="ts">
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import { createEventDispatcher } from "svelte";

  export let depositorPrefix: string = undefined;
  export let metadataType = undefined;
  export let dmdTask: DMDTask = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  function handleStore(event: any) {
    dispatch("store", event);
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
          <td>Copy2access</td>
          <td>copy2preservation</td>
        </tr>
      {/each}
    </table>
  {/if}
  <br />
  <button class="button primary" type="submit" on:click={handleStore}>
    Store Results
  </button>
</div>

<style>
  .split-task-result {
    min-height: 50rem;
  }
</style>
