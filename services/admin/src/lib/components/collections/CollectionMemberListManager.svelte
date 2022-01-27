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
  let refSlug = "";

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
    let newSlugs = slugs.filter((x) => !slugArray.includes(x));

    if (!newSlugs.length) return;

    validating = true;

    if (timer) clearTimeout(timer);

    timer = setTimeout(async () => {
      error = "";
      if (destinationCollection?.id) {
        try {
          const resolutions = await $session.lapin.mutation(
            "slug.lookupMany",
            newSlugs
          );

          const invalidSlugs: Slug[] = [];

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

          /*slugArray = slugArray.filter((x) => !invalidSlugs.includes(x));
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

  function handleSavePressed() {}

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
    <div class="edit-wrap auto-align auto-align__wrap">
      <div class="member-editor">
        <b>Manage Member List</b>
        <div
          class="options-wrap auto-align auto-align__wrap auto-align__a-center"
        >
          <span class="action-wrap">
            <label>
              <input type="radio" bind:group={action} name="action" value={1} />
              Add
            </label>

            <label>
              <input type="radio" bind:group={action} name="action" value={2} />
              Remove
            </label>

            <label>
              <input type="radio" bind:group={action} name="action" value={3} />
              Overwrite
            </label>
          </span>

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
        </div>

        {#if action === 1}
          <br />
          <br />
          <div>
            <label>
              <input
                type="radio"
                bind:group={addOption}
                name="addOption"
                value={1}
              />
              At Begining of List
            </label>

            <label>
              <input
                type="radio"
                bind:group={addOption}
                name="addOption"
                value={2}
              />
              At End of List
            </label>

            <label>
              <input
                type="radio"
                bind:group={addOption}
                name="addOption"
                value={3}
              />
              Before Slug {#if addOption === 3}
                <input bind:value={refSlug} /><br />{/if}
            </label>

            <label>
              <input
                type="radio"
                bind:group={addOption}
                name="addOption"
                value={4}
              />
              After Slug {#if addOption === 4}
                <input bind:value={refSlug} />{/if}
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
            rows={15}
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
        <button
          class="secondary"
          on:click={() => {
            //showDeleteModal = false
            opened = false;
          }}
        >
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
          Save Member List
        {/if}
      </button>
    </div>
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
  }
  .action-wrap {
    flex: 9;
    width: 100%;
  }
</style>
