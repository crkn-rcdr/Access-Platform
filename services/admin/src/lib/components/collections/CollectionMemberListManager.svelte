<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import { createEventDispatcher, onMount } from "svelte";
  import type { PagedCollection } from "@crkn-rcdr/access-data/src/access/Collection";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import PrefixSlugSearchBox from "$lib/components/access-objects/PrefixSlugSearchBox.svelte";
  import LoadingButton from "$lib/components/shared/LoadingButton.svelte";
  import type { Slug } from "@crkn-rcdr/access-data";
  import Toggle from "../shared/Toggle.svelte";
  import Loading from "../shared/Loading.svelte";
  import { isEqual } from "lodash-es";
  import { showConfirmation } from "$lib/utils/confirmation";

  /**
   * @type {PagedCollection} The Collection where the members are added to.
   */
  export let destinationCollection: PagedCollection;

  /**
   * @type {boolean} If the collection has members or not
   */
  export let isCollectionEmpty = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {NodeJS.Timeout | null} Used to debounce the searching of slugs.
   */
  let timer: NodeJS.Timeout | null = null;

  let slugArray: Slug[] = [];
  let slugTextValue = "";
  let slugNoidMap = {};
  let error = "";
  let loading = false;
  let validating = false;
  let opened = false;
  let action = 1;
  let addOption = 1;
  let saving = false;
  let beforeRefSlug = "";
  let afterRefSlug = "";

  async function handleFillPressed() {
    if (loading) return;
    loading = true;
    if (destinationCollection?.id && slugArray.length == 0) {
      error = "";
      slugArray = await $session.lapin.query(
        "collection.getMemberSlugs",
        destinationCollection.id
      );
      slugTextValue = slugArray.join("\n");
    }
    loading = false;
  }

  async function validateSlugList(slugs: Slug[]) {
    // Return if nothing changed ~ too buggy
    // if (isEqual(slugs, slugArray)) return;
    // just validate new things...
    //let newSlugs = slugs.filter((x) => !slugArray.includes(x));
    if (!slugs.length) return;

    validating = true;

    if (timer) clearTimeout(timer);

    timer = setTimeout(async () => {
      error = "";
      if (destinationCollection?.id) {
        try {
          const invalidSlugs: Slug[] = [];
          //if (newSlugs.length) {
          const resolutions = await $session.lapin.mutation(
            "slug.lookupMany",
            slugs
          );

          for (const result of resolutions) {
            if (result.length) {
              const slug = result[0];
              if (
                result.length === 2 &&
                result[1].found &&
                "result" in result[1]
              ) {
                slugNoidMap[slug] = result[1].result.id;
              } else invalidSlugs.push(slug);
            }
          }
          //}

          slugArray = slugs; /*.filter((x) => !invalidSlugs.includes(x));
          slugTextValue = slugArray.join("\n");*/

          if (invalidSlugs.length) {
            error =
              "Invalid slugs entered. Please remove them from the text box before continuing:<br/>" +
              invalidSlugs.join("<br/>");
          }
        } catch (e) {
          console.log(e?.message);
          error =
            "Could not valid slugs. Please contact the platform team for assistance.";
        }
      }
      validating = false;
    }, 5000);
  }

  function getRequestData() {
    /*
     { request : "prependMembers" | "appendMembers" | "addBySlug" | , data: any }
    */
    let request:
      | "prependMembers"
      | "appendMembers"
      | "addBySlug"
      | "removeMembersBySlug"
      | "overwriteMembers"
      | null;
    let data: any = {
      id: destinationCollection.id,
      members: slugArray,
      user: $session.user, //.optional(),
    };
    if (action === 1) {
      // add
      if (addOption === 1) {
        request = "prependMembers";
      } else if (addOption === 2) {
        request = "appendMembers";
      } else if (addOption === 3) {
        request = "addBySlug";
        data = {
          ...data,
          refMember: beforeRefSlug,
          operation: "addBefore",
        };
      } else if (addOption === 4) {
        request = "addBySlug";
        data = {
          ...data,
          refMember: afterRefSlug,
          operation: "addAfter",
        };
      }
    } else if (action === 2) {
      // remove
      request = "removeMembersBySlug";
    } else if (action === 3) {
      // overwrite
      request = "overwriteMembers";
    }

    return { request, data };
  }

  async function handleSavePressed() {
    if (saving) return;
    saving = true;
    if (!slugArray.length) return;
    await showConfirmation(
      async () => {
        try {
          const requestInfo = getRequestData();
          console.log(requestInfo);
          if (requestInfo.request) {
            const response = await $session.lapin.mutation(
              `collection.${requestInfo.request}`,
              requestInfo.data
            );
            dispatch("operationComplete");
            handleCancelPressed();

            return {
              success: true,
              details: "",
            };
          } else {
            return {
              success: false,
              details: "Could not make request.",
            };
          }
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "Success: member list updated.",
      "Error: failed to update member list."
    );
  }

  function handleCancelPressed() {
    slugArray = [];
    slugTextValue = "";
    slugNoidMap = {};
    error = "";
    loading = false;
    validating = false;
    action = 1;
    addOption = 1;
    beforeRefSlug = "";
    afterRefSlug = "";
    saving = false;
    opened = false;
  }

  $: {
    if (isCollectionEmpty) opened = true;
  }
</script>

<div class="member-selector-wrap add-menu" class:unexpanded={!opened}>
  {#if !opened && !isCollectionEmpty}
    <button class="primary lg" on:click={() => (opened = true)}>
      Manage Member List
    </button>
  {/if}

  {#if opened}
    {#if saving}
      <div class="saving-loader-wrap">
        <Loading backgroundType="gradient" />
        <br />
        Saving changes, please wait...
      </div>
    {:else}
      <div class="edit-wrap auto-align auto-align__wrap">
        <div class="member-editor">
          <b>Manage Member List</b>
          <div
            class="options-wrap auto-align auto-align__wrap auto-align__a-center"
          >
            <span class="action-wrap">
              <label>
                <input
                  type="radio"
                  bind:group={action}
                  name="action"
                  value={1}
                />
                Add
              </label>

              <label>
                <input
                  type="radio"
                  bind:group={action}
                  name="action"
                  value={2}
                />
                Remove
              </label>

              <label>
                <input
                  type="radio"
                  bind:group={action}
                  name="action"
                  value={3}
                />
                Overwrite
              </label>
            </span>

            {#if action !== 1}
              <LoadingButton
                buttonClass="secondary"
                on:clicked={handleFillPressed}
                showLoader={loading}
              >
                <span slot="content"
                  >{loading
                    ? "Loading members listing..."
                    : "Auto-fill Current Members"}
                </span>
              </LoadingButton>
            {/if}
          </div>

          {#if action === 1}
            <br />
            <div>
              <label>
                <input
                  type="radio"
                  bind:group={addOption}
                  name="addOption"
                  value={1}
                />
                At beginning of list
              </label>

              <label>
                <input
                  type="radio"
                  bind:group={addOption}
                  name="addOption"
                  value={2}
                />
                At end of list
              </label>

              <label>
                <input
                  type="radio"
                  bind:group={addOption}
                  name="addOption"
                  value={3}
                />
                Before slug {#if addOption === 3}
                  <input bind:value={beforeRefSlug} />{/if}
              </label>

              <label>
                <input
                  type="radio"
                  bind:group={addOption}
                  name="addOption"
                  value={4}
                />
                After slug {#if addOption === 4}
                  <input bind:value={afterRefSlug} />{/if}
              </label>
            </div>
          {/if}

          <br />

          {#if validating}
            <div>
              <Loading size="sm" backgroundType="gradient" />
              Validing slugs...
            </div>
          {/if}
          <div class:disabled={loading}>
            <PrefixSlugSearchBox
              rows={10}
              input={slugTextValue}
              on:slugs={(event) => validateSlugList(event.detail)}
            />
          </div>
        </div>
        <div class="member-errors">
          <NotificationBar status="fail" message={error} />
        </div>
      </div>

      <div>
        {#if !isCollectionEmpty}
          <button class="secondary" on:click={handleCancelPressed}>
            Cancel
          </button>
        {/if}
        <button
          disabled={loading ||
            validating ||
            error.length !== 0 ||
            slugArray.length === 0}
          class:save={action === 1}
          class:danger={action !== 1}
          on:click={handleSavePressed}
        >
          {#if action === 1}
            Add Members
          {:else if action === 2}
            Remove Members
          {:else if action === 3}
            Overwrite Member List
          {/if}
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .member-selector-wrap {
    padding: var(--perfect-fourth-6);
    height: 80vh;
    overflow-y: auto;
  }
  .member-selector-wrap.unexpanded {
    display: inline-block;
    width: fit-content;
    height: fit-content;
  }
  .edit-wrap {
    width: 100%;
  }
  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  .member-editor {
    width: 100%;
    flex: 7;
    margin-right: 1rem;
  }
  .member-errors {
    flex: 3;
  }
  .options-wrap {
    width: 100%;
    min-height: 5rem;
  }
  .action-wrap {
    flex: 9;
    width: 100%;
  }
  .saving-loader-wrap {
    text-align: center;
  }
</style>
