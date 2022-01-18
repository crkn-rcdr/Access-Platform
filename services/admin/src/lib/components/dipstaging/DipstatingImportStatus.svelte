<script lang="ts">
  import { session } from "$app/stores";

  import type { ImportStatus, LegacyPackage } from "@crkn-rcdr/access-data";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import XmlViewer from "../shared/XmlViewer.svelte";

  export let item: ImportStatus | LegacyPackage;

  let error: string;

  async function clearLastImportStatus() {
    //cancelSmelt
    try {
      const response = await $session.lapin.mutation(`dipstaging.cancelSmelt`, {
        user: $session.user,
        id: item["id"],
      });
      if ("smelt" in item) {
        item["smelt"] = null;
      } else {
        item["status"] = null;
        item["requestDate"] = null;
        item["processDate"] = null;
        item["message"] = null;
      }
    } catch (e) {
      console.log(e);
      error = e?.message;
    }
  }
</script>

<!-- LEGACY PACKAGE -->
{#if "smelt" in item && item["smelt"] !== null}
  <table>
    <tbody>
      <tr>
        <td class="detail-label">Import Status:</td>
        <td>
          {item.smelt?.["succeeded"] ? "Succeeded" : "Failed"}
        </td>
      </tr>
      <tr>
        <td class="detail-label">Request Date:</td>
        <td>
          {item.smelt?.requestDate
            ? new Date(item.smelt?.requestDate).toLocaleString()
            : "N/A"}
        </td>
      </tr>
      <tr>
        <td class="detail-label">Process Date:</td>
        <td>
          {item.smelt?.["processDate"]
            ? new Date(item.smelt?.["processDate"]).toLocaleString()
            : "N/A"}
        </td>
      </tr>
      <tr>
        <td class="detail-label">Message:</td>
        <td>
          <XmlViewer
            xml={item.smelt?.["message"]?.length
              ? item.smelt?.["message"]
              : "N/A"}
          />
        </td>
      </tr>
    </tbody>
  </table>

  <NotificationBar status="fail" message={error} />
  <br />
  <button class="secondary" on:click={clearLastImportStatus}>
    Clear Last Import Status
  </button>
  <br />
{:else if "status" in item && item["status"] !== null && item["status"] !== "new"}
  <!-- IMPORT STATUS -->
  <table>
    <tbody>
      <tr>
        <td class="detail-label">Import Status:</td>
        <td>{item["status"] === "succeeded" ? "Succeeded" : "Failed"}</td>
      </tr>
      <tr>
        <td class="detail-label">Request Date:</td>
        <td>{item["requestDate"]}</td>
      </tr>
      <tr>
        <td class="detail-label">Process Date:</td>
        <td>{item["processDate"]}</td>
      </tr>
      <tr>
        <td class="detail-label">Message:</td>
        <td>
          <XmlViewer xml={item["message"]?.length ? item["message"] : "N/A"} />
        </td>
      </tr>
    </tbody>
  </table>

  <NotificationBar status="fail" message={error} />
  <br />
  <button class="secondary" on:click={clearLastImportStatus}>
    Clear Last Import Status
  </button>
  <br />
{:else}
  <br />
  There is no import status information on record.
{/if}
