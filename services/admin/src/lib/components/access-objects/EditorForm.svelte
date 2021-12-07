<!--
@component
### Overview
This component displays the non content properties for an access editorObject and allows users to edit them.

### Properties
|    |    |    |
| -- | -- | -- |
| editorObject: PagedAccessObject | required | The PagedAccessObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model. |

### Usage
```  
<InfoEditor bind:editorObject />
```
*Note: `bind:` is required for changes to the editorObject to be reflected in higher level components.*
-->
<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import type {
    Membership,
    Noid,
    PagedAccessObject,
  } from "@crkn-rcdr/access-data";
  import { typedChecks } from "$lib/utils/validation";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import EditorInput from "$lib/components/access-objects/EditorInput.svelte";
  import { createEventDispatcher } from "svelte";
  import type { Writable } from "svelte/store";
  //import { editorObjectStore } from "$lib/stores/accessObjectEditorStore";

  /**
   * @type {PagedAccessObject} The editorObject that will be manipulated by the user, usually, a copy of an access object that acts as a form model.
   */
  export let editorObject: PagedAccessObject; // Not sure if we should pass an editorObject or have a list of props (ex: slug, label, ...) that can be null, and show ones that are instantiated only?

  /**
   * @type {"create" | "edit"} An indicator variable if the editor is in create mode or edit mode.
   */
  export let mode: "create" | "edit";

  /**
   * Membership record for this object.
   */
  export let membership: Membership;

  /**
   * The session store that contains the module for sending requests to lapin.
   */
  const session = getStores<Session>().session;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  function handleSavePressed(event: any) {
    dispatch("save", event.detail);
  }

  const removeMembership = async (collectionID: Noid) => {
    try {
      await $session.lapin.mutation("collection.removeMembers", {
        user: $session.user,
        id: collectionID,
        members: [editorObject.id],
      });

      membership = membership.filter((record) => record.id === collectionID);
    } catch (e) {
      console.log(e);
    }
  };

  $: {
    editorObject;
    dispatch("change", editorObject);
  }
</script>

{#if editorObject}
  <div class="info-form">
    {#if editorObject.type === "collection" || editorObject.type === "manifest"}
      <label for="slug">Slug</label>
      {#if mode === "edit"}
        <EditorInput
          keys={["slug"]}
          bind:value={editorObject["slug"]}
          on:save={handleSavePressed}
          saveDisabled={!editorObject["slug"] ||
            editorObject["slug"].length === 0}
        >
          <div>
            <Resolver bind:slug={editorObject["slug"]} />
          </div>
        </EditorInput>
      {:else}
        <Resolver bind:slug={editorObject["slug"]} />
      {/if}

      <br /><br />

      <label for="label">Label</label>
      <br />
      <NotificationBar
        message={typedChecks[editorObject["type"]].getLabelValidationMsg(
          editorObject["label"]
        )}
        status="fail"
      />

      {#if mode === "edit"}
        <EditorInput
          keys={["label", "none"]}
          bind:value={editorObject["label"]["none"]}
          on:save={handleSavePressed}
          saveDisabled={!editorObject["label"]["none"] ||
            editorObject["label"]["none"].length === 0}
        >
          <textarea
            id="label"
            name="label"
            bind:value={editorObject["label"]["none"]}
            on:keyup={() => {
              // Triggers validation msg
              if (editorObject?.["label"]?.["none"]?.length === 0)
                editorObject["label"]["none"] = undefined;
            }}
          />
        </EditorInput>
      {:else}
        <textarea
          id="label"
          name="label"
          bind:value={editorObject["label"]["none"]}
          on:keyup={() => {
            // Triggers validation msg
            if (editorObject?.["label"]?.["none"]?.length === 0)
              editorObject["label"]["none"] = undefined;
          }}
        />
      {/if}
      <br /><br />

      {#if editorObject.type === "collection"}
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

      {#if membership?.length > 0}
        <p>
          This {editorObject["type"]} is a member of the following collections:
        </p>
        <ul>
          {#each membership as coll}
            <li>
              <a href="/object/{coll.id}">{coll.label["none"]} ({coll.slug})</a>
              <button
                class="sm danger"
                on:click={() => removeMembership(coll.id)}>Remove</button
              >
            </li>
          {/each}
        </ul>
      {:else}
        <br />
        <p>Membership</p>
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
  </div>
{/if}

<style>
  .info-form {
    padding: 1.5rem;
  }
  label,
  textarea {
    width: 100%;
  }
  li button {
    margin-left: 0.5ch;
  }
</style>
