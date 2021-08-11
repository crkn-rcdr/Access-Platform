<!--Skeleton for Bulk addition-->
<script lang="ts">
  import CollectionContentEditor from "./CollectionContentEditor.svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import type { ObjectList } from "@crkn-rcdr/access-data";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import { createEventDispatcher } from "svelte";

  /**
   * @type {Manifest} The manifest to add selected canvases to.
   */
  export let destinationMember: Collection;

  /**
   * @type {number} The starting index to add the selected canvases at.
   */
  export let destinationIndex = 0;

  /**
   * @type {boolean} If the user is allowed to select multiple canvases to add.
   */
  export let multiple = true;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {Manifest} The manifest to select canvases from.
   */
  let selectedMember: Collection;

  /**
   * @type {ObjectList} The canvases the user selects.
   */
  let selectedMembers: ObjectList = [];

  /**
   * @type {string} If a manifest is selected.
   */
  let isMemberSelected = false;

  /**
   * @type {string} If the select all button is activated.
   */
  let isAllSelected = false;

  /**
   * @type {string} An error message to be displayed.
   */
  let error = "";

  /**
   * When a manifest is selected from the table of search results, grab its details from the backend.
   * @param event
   * @returns void
   */
  async function handleSelect(event: any) {
    try {
      let prefixedNoid = event.detail;
      const response = await $session.lapin.query(
        "accessObject.get",
        prefixedNoid
      );
      if (response) {
        const object = AccessObject.parse(response);
        if (isCollection(object)) {
          error = "Error: Object is a collection, please select another.";
        } else if (isManifest(object)) {
          selectedMember = object;
          isMemberSelected = true;
        }
      } else {
        error = response.toString();
      }
    } catch (e) {
      error = e;
    }
  }
  function handleCancelPressed() {
    selectedMembers = [];
    dispatch("done");
  }

  /**
   * When add is pressed, add the selected canvases to the begining of the destination manifest's canvases list, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */
  function handleAddPressed() {
    destinationMember?.members?.splice(destinationIndex, 0, ...selectedMembers);
    destinationMember = destinationMember;
    selectedMembers = [];
    dispatch("done");
  }
</script>
