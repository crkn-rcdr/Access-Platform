<!--
@component
### Overview
This component displays the non content properties for an access object and allows users to edit them.

### Properties
|    |    |    |
| -- | -- | -- |
| object: AccessObject | required | The AccessObject object that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model. |

### Usage
```  
<InfoEditor bind:object />
```
*Note: `bind:` is required for changes to the object to be reflected in higher level components.*
-->
<script lang="ts">
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { getSlugValidationMsg, typedChecks } from "$lib/validation";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";

  /**
   * @type {AccessObject} The AccessObject object that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model.
   */
  export let object: AccessObject; // Not sure if we should pass an object or have a list of props (ex: slug, label, ...) that can be null, and show ones that are instantiated only?

  /**
   * @type {boolean} Controls if the notification bar for slugs shows the error that the slug is unavailable, or if it shows a validation error (or nothing if it looks good)
   */
  let showSlugUnavailable = false;

  /**
   * @type {string} The message to be shown if the slug is not available.
   */
  let slugUnavailableMessage = "";
</script>

{#if object}
  <form>
    {#if isManifest(object) || isCollection(object)}
      <label for="slug">Slug</label>
      <NotificationBar
        message={showSlugUnavailable
          ? slugUnavailableMessage
          : getSlugValidationMsg(object["slug"])}
        status="fail"
      />
      <Resolver
        bind:slug={object["slug"]}
        noid={object["id"]}
        on:available={(event) => {
          if (!event?.detail?.["status"]) {
            slugUnavailableMessage = `${object["slug"]} was unavailable.  The input has been reset, please try again with a different slug.`;
            object["slug"] = event.detail["slug"]; // No easier way to disable save button that I can think of
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
        message={typedChecks[object["type"]].getLabelValidationMsg(
          object["label"]
        )}
        status="fail"
      />
      <textarea
        id="label"
        name="label"
        bind:value={object["label"]["none"]}
        on:keyup={() => {
          // Triggers validation msg
          if (object?.["label"]?.["none"]?.length === 0)
            object["label"]["none"] = undefined;
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
  input,
  textarea {
    width: 100%;
  }
</style>
