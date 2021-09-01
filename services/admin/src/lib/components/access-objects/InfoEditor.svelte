<!--
@component
### Overview
This component displays the non content properties for an access editorObject and allows users to edit them.

### Properties
|    |    |    |
| -- | -- | -- |
| serverObject: AccessObject | required | The AccessObject editorObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model. |

### Usage
```  
<InfoEditor bind:editorObject />
```
*Note: `bind:` is required for changes to the editorObject to be reflected in higher level components.*
-->
<script lang="ts">
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { getSlugValidationMsg, typedChecks } from "$lib/utils/validation";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";

  /**
   * @type {AccessObject} The AccessObject editorObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model.
   */
  export let editorObject: AccessObject; // Not sure if we should pass an editorObject or have a list of props (ex: slug, label, ...) that can be null, and show ones that are instantiated only?

  /**
   * @type {boolean} Controls if the notification bar for slugs shows the error that the slug is unavailable, or if it shows a validation error (or nothing if it looks good)
   */
  let showSlugUnavailable = false;

  /**
   * @type {string} The message to be shown if the slug is not available.
   */
  let slugUnavailableMessage = "";
</script>

{#if editorObject}
  <form>
    {#if isManifest(editorObject) || isCollection(editorObject)}
      <label for="slug">Slug</label>
      <NotificationBar
        message={showSlugUnavailable
          ? slugUnavailableMessage
          : getSlugValidationMsg(editorObject["slug"])}
        status="fail"
      />
      <Resolver
        bind:slug={editorObject["slug"]}
        on:available={(event) => {
          if (!event?.detail?.["status"]) {
            slugUnavailableMessage = `${editorObject["slug"]} was unavailable.  The input has been reset, please try again with a different slug.`;
            editorObject["slug"] = event.detail["slug"]; // No easier way to disable save button that I can think of
            showSlugUnavailable = true;
          } else {
            showSlugUnavailable = false;
          }
        }}
      />

      <br /><br />

      <label for="label">Label</label>
      <br />
      <NotificationBar
        message={typedChecks[editorObject["type"]].getLabelValidationMsg(
          editorObject["label"]
        )}
        status="fail"
      />
      <textarea
        id="label"
        name="label"
        bind:value={editorObject["label"]["none"]}
        on:keyup={() => {
          // Triggers validation msg
          if (editorObject?.["label"]?.["none"]?.length === 0)
            editorObject["label"]["none"] = undefined;
        }}
      /><br /><br />

      <!--Fixtures don't have this yet, causes save to be enabled on load-->

      <!--span>
    <label for="behavior">Behavior</label>
    <select id="behavior" name="behavior" bind:value={manifest["behavior"]}>
      <option>continuous</option>
      <option>individuals</option>
      <option>paged</option>
      <option>unordered</option>
    </select>
  </span>

  <span>
    <label for="viewing-direction">Viewing Direction</label>
    <select
      id="viewing-direction"
      name="viewing-direction"
      bind:value={manifest["viewingDirection"]}
    >
      <option>left-to-right</option>
      <option>right-to-left</option>
      <option>top-to-bottom</option>
      <option>bottom-to-top</option>
    </select>
  </span><br /-->
    {/if}
  </form>
{/if}

<style>
  form {
    padding: 1.5rem;
  }
  label,
  textarea {
    width: 100%;
  }
</style>
