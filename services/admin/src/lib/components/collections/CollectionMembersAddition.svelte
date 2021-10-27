<script lang="ts">
  import type { Depositor, Session } from "$lib/types";
  import { getStores } from "$app/stores";

  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";

  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";

  /**
   * @type {Collection} The Collection where the members are added to.
   */
  export let destinationMember: Collection;
  /**
   * To bind the context of members value.
   */
  export let contextDisplay;

  /**
   * @type {number} The starting index to add the selected canvases at.
   */
  export let destinationIndex = 0;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} If a Collection is selected.
   */
  let isMemberSelected = false;
  let addedMember = false;

  /**
   * @type {string} An prefix to the Depositor.
   */
  let depositor: Depositor = {
    prefix: "none",
    label: "",
  };

  /**
   * When a collection is selected from the table of search results, grab its details from the backend.
   * @param event
   * @returns void
   */
  function addClicked() {
    addedMember = true;
  }

  let id: string = destinationMember.id;
  let slugArray: string[];
  let input: "";
  //  let documentSlug: {} = [];

  // https://github.com/sindresorhus/type-fest/blob/main/source/promise-value.d.ts
  type PromiseValue<PromiseType> = PromiseType extends PromiseLike<infer Value>
    ? PromiseValue<Value>
    : PromiseType;
  let resolutions: PromiseValue<ReturnType<typeof resolveMembers>>;

  async function resolveMembers() {
    let slugArray = input.split(/[,|\s]/);

    if (depositor.prefix !== "none")
      slugArray = slugArray.map((slug) => `${depositor.prefix}.${slug}`);

    const response = await $session.lapin.query("collection.checkAdditions", {
      id,
      slugArray,
    });

    resolutions = response;

    // I'm returning here so that we can type `resolutions` properly (see above)
    return response;
  }

  function handleCancelPressed() {
    addedMember = false;
  }

  /**
   * When add is pressed, add the selected members to the begining of the destination collection's members list, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */
  let resultArray: string[] = [];
  function checkIfAllItemsSelected(event) {
    if (event.target) {
      resultArray.push(event.target.value);
    }
  }

  async function handleAddPressed() {
    for (let index in resultArray) {
      console.log("check the result array", resultArray);
      const resolution = await $session.lapin.query(
        "collection.viewMembersContext",
        resultArray
      );
      resolution.map((slug) => {
        if (slug[1].found === true) {
          contextDisplay.push({ id: slug[0], result: slug[1].result });
        }
      });

      destinationMember?.members?.splice(destinationIndex, 0, {
        id: resultArray[index],
      });

      contextDisplay = contextDisplay;
      destinationMember = destinationMember;
    }
    addedMember = false;
    isMemberSelected = true;
  }
  function clearText() {
    input = "";
    depositor = {
      prefix: "none",
      label: "",
    };
  }
</script>

<div class="canvas-selector-wrap add-menu">
  {#if !isMemberSelected}
    <div class="move-button">
      <button class="primary lg" on:click={addClicked}>Member LookUp</button>
      {#if addedMember}
        <div class="exit-button">
          <button
            class="secondary cancel-button auto-align auto-align__a-center"
            on:click={handleCancelPressed}
          >
            <div class="icon">
              <TiArrowBack />
            </div>
            Exit
          </button>
          
        </div>
      {/if}
    </div>
    {#if addedMember}
      <div>
        <PrefixSelector bind:depositor />
        <textarea bind:value={input} /><br />
        <button class="primary lg" on:click={resolveMembers}>Lookup</button>
        <button class="primary lg" on:click={clearText}>Clear Text</button>
        <br />
      </div>
      <br />
      {#if resolutions}
        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>Status</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {#each Object.entries(resolutions) as [slug, resolution]}
              <tr>
                <td>{slug}</td>
                <td>
                  {#if resolution.resolved === true}
                    found
                  {:else if resolution.resolved === false}
                    {resolution.error}
                  {/if}
                </td>
                <td class="success">
                  {#if resolution.resolved === true}
                    <input
                      type="checkbox"
                      on:change={checkIfAllItemsSelected}
                      bind:value={resolution.id}
                    />
                    {resolution.id}
                  {:else}
                    <span>No ID resolved to add</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
          <br />
          <button class="primary lg" on:click={handleAddPressed}>Add</button>
          <br />
          <br />
        </table>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .move-button {
    display: flex;
  }
  .exit-button {
    padding-left: 50%;
  }
  textarea {
    display: grid;
    background-color: var(--primary-light);
    width: 100%;
    height: 100%;
    grid-column: 1/2;
  }

  .success {
    background-color: var(--success-light);
    color: var(--success);
  }
</style>
