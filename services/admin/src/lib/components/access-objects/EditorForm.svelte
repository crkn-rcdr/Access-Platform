<!--
@component
### Overview
This component displays the non content properties for an access editorObject and allows users to edit them.

### Properties
|    |    |    |
| -- | -- | -- |
| editorObject: AccessObject | required | The AccessObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model. |

### Usage
```  
<InfoEditor bind:editorObject />
```
*Note: `bind:` is required for changes to the editorObject to be reflected in higher level components.*
-->
<script lang="ts">
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { typedChecks } from "$lib/utils/validation";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import EditorInput from "$lib/components/access-objects/EditorInput.svelte";
  import { createEventDispatcher } from "svelte";
  import { editorObjectStore } from "$lib/stores/accessObjectEditorStore";

  /**
   * @type {AccessObject} The AccessObject editorObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model.
   */
  //export let editorObject: AccessObject; // Not sure if we should pass an editorObject or have a list of props (ex: slug, label, ...) that can be null, and show ones that are instantiated only?

  /**
   * @type {"create" | "edit"} An indicator variable if the editor is in create mode or edit mode.
   */
  let mode: "create" | "edit";

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  function handleSavePressed(event: any) {
    dispatch("save", event.detail);
  }

  $: {
    mode = $editorObjectStore?.id ? "edit" : "create";
  }
</script>

{#if $editorObjectStore}
  <div class="info-form">
    {#if isManifest($editorObjectStore) || isCollection($editorObjectStore)}
      <label for="slug">Slug</label>
      {#if mode === "edit"}
        <EditorInput
          keys={["slug"]}
          bind:value={$editorObjectStore["slug"]}
          on:save={handleSavePressed}
        >
          <div>
            <Resolver bind:slug={$editorObjectStore["slug"]} />
          </div>
        </EditorInput>
      {:else}
        <Resolver bind:slug={$editorObjectStore["slug"]} />
      {/if}

      <br /><br />

      <label for="label">Label</label>
      <br />
      <NotificationBar
        message={typedChecks[$editorObjectStore["type"]].getLabelValidationMsg(
          $editorObjectStore["label"]
        )}
        status="fail"
      />

      {#if mode === "edit"}
        <EditorInput
          keys={["label", "none"]}
          bind:value={$editorObjectStore["label"]["none"]}
          on:save={handleSavePressed}
        >
          <textarea
            id="label"
            name="label"
            bind:value={$editorObjectStore["label"]["none"]}
            on:keyup={() => {
              // Triggers validation msg
              if ($editorObjectStore?.["label"]?.["none"]?.length === 0)
                $editorObjectStore["label"]["none"] = undefined;
            }}
          />
        </EditorInput>
      {:else}
        <textarea
          id="label"
          name="label"
          bind:value={$editorObjectStore["label"]["none"]}
          on:keyup={() => {
            // Triggers validation msg
            if ($editorObjectStore?.["label"]?.["none"]?.length === 0)
              $editorObjectStore["label"]["none"] = undefined;
          }}
        />
      {/if}
      <br /><br />

      {#if isCollection($editorObjectStore)}
        <label for="behavior">Behaviour</label><br />
        <select
          id="behavior"
          name="behavior"
          bind:value={$editorObjectStore["behavior"]}
        >
          <option>multi-part</option>
          <option>unordered</option>
        </select><br /><br />
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
</style>
