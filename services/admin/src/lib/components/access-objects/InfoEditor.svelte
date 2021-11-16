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
  import type { AccessObject, Membership } from "@crkn-rcdr/access-data";
  import { typedChecks } from "$lib/utils/validation";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";

  /**
   * The AccessObject editorObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model.
   */
  export let editorObject: AccessObject; // Not sure if we should pass an editorObject or have a list of props (ex: slug, label, ...) that can be null, and show ones that are instantiated only?

  /**
   * Membership record for this object.
   */
  export let membership: Membership;
</script>

{#if editorObject}
  <form>
    {#if isManifest(editorObject) || isCollection(editorObject)}
      <label for="slug">Slug</label>

      <Resolver bind:slug={editorObject["slug"]} />

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

      {#if isCollection(editorObject)}
        <label for="behavior">Behaviour</label><br />
        <select
          id="behavior"
          name="behavior"
          bind:value={editorObject["behavior"]}
        >
          <option>multi-part</option>
          <option>unordered</option>
        </select><br /><br />
      {/if}

      <p>Memberships</p>
      {#if membership.length > 0}
        <ul>
          {#each membership as coll}
            <li>
              <a href="/object/{coll.id}">{coll.label["none"]} ({coll.slug})</a>
            </li>
          {/each}
        </ul>
      {:else}
        <p>This {editorObject.type} is not a member of any collections.</p>
      {/if}
      <!--Fixtures don't have this yet, causes save to be enabled on load-->

      <!--span>

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
