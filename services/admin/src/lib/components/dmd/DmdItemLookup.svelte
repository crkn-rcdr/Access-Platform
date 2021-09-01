<!--
@component
### Overview
This components takes the items in a successfull dmd task and looks them up in a selected access platform and in preservation. it adds the lookup results to itemsLookupAndUpdateResults.

### Properties
|    |    |    |
| -- | -- | -- |
| accessPlatform: AccessPlatform | required | The access platform to look for the items in. |
| state: "ready" or "loading" or "loaded" or "error" | optional | This variable keeps track of the state of the component, to show relevant messages to the user. |
| itemsToLookup: ParseRecord[] | optional | The items to search for. |
| itemsLookupAndUpdateResults: (DmdLoadedParseRecord or DmdUpdatedParseRecord)[] | optional | The dmdtask items lookup and update results. Indexing exactly matches the itemsToLookup. |

### Usage
```
<DmdItemLookup
  bind:state={lookupState}
  bind:accessPlatform
  bind:itemsLookupAndUpdateResults
  itemsToLookup={dmdTask.items}
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { AccessPlatform } from "$lib/types";
  import DmdAccessPlatformSelector from "$lib/components/dmd/DmdAccessPlatformSelector.svelte";
  import LoadingButton from "$lib/components/shared/LoadingButton.svelte";

  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTaskId: string;

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  export let accessPlatform: AccessPlatform;

  function handleLookupPressed() {
    dmdTasksStore.lookupItems(dmdTaskId, accessPlatform.prefix);
  }
</script>

{#if $dmdTasksStore[dmdTaskId]}
  <div
    class="look-up-wrap auto-align auto-align__a-center auto-align__j-between "
  >
    <div class="select-wrap">
      <DmdAccessPlatformSelector bind:depositor={accessPlatform} />
    </div>

    {#if accessPlatform?.prefix?.length}
      <LoadingButton
        buttonClass={`${
          $dmdTasksStore[dmdTaskId].lookupState === "ready"
            ? "primary"
            : "secondary"
        }`}
        showLoader={$dmdTasksStore[dmdTaskId].lookupState === "loading"}
        on:clicked={handleLookupPressed}
      >
        <span slot="content">
          {$dmdTasksStore[dmdTaskId].lookupState !== "loading"
            ? $dmdTasksStore[dmdTaskId].lookupState === "loaded"
              ? "Look-up Again"
              : "Look-up"
            : "Looking-up..."}
        </span>
      </LoadingButton>
    {/if}
  </div>
{/if}

<style>
  .look-up-wrap {
    width: 100%;
  }
  .select-wrap {
    flex: 8;
    margin-right: 1rem;
  }
</style>
