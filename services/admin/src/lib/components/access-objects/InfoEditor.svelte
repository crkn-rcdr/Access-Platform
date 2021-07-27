<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*

**Example two**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { getSlugValidationMsg, typedChecks } from "$lib/validation";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";

  /**
   * @type {string} Slug being resolved.
   */
  export let object: AccessObject; // Not sure if we should pass an object or have a list of props (ex: slug, label, ...) that can be null, and show ones that are instantiated only?

  /**
   * @type {string} Slug being resolved.
   */
  let showSlugUnavailable = false;

  /**
   * @type {string} Slug being resolved.
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
