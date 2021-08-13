<script lang="ts">
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import Loading from "../shared/Loading.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import TempPrefixSelector from "./TempPrefixSelector.svelte";

  let prefix;
  let shouldUpdateInAccess = true;
  let shouldUpdateInPreservation = true;

  let activeStepIndex = 0;
  let hasLookupRan = false;
  let showLoader = false;
</script>

<div class="wrapper">
  <br />
  <NotificationBar message="Metadata uploaded sucessfully!" />
  <ScrollStepper bind:activeStepIndex displayPrevious={true}>
    <ScrollStepperStep
      title={`${
        hasLookupRan ? "Re-select" : "Select"
      } the Access Platform of the Items`}
    >
      <div slot="icon">1</div>
      <div class="depositor-grid grid grid__col_2">
        <TempPrefixSelector bind:prefix />
        {#if prefix?.length}
          <button
            class="primary"
            on:click={() => {
              showLoader = true;
              setTimeout(() => {
                activeStepIndex = 1;
                hasLookupRan = true;
                showLoader = false;
              }, 2000);
            }}
          >
            Look-up
          </button>
        {/if}
      </div>
      <br />
      <br />
      {#if showLoader}
        <div class="loading-wrap">
          <Loading backgroundType="secondary" />
        </div>
      {:else if !hasLookupRan}
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Label</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
          </tbody>
        </table>
      {/if}
    </ScrollStepperStep>
    <ScrollStepperStep
      title="Update the Descriptive Metadata Records of the Items"
      isLastStep={true}
    >
      <div slot="icon">2</div>

      <div class="update-wrap">
        <div class="update-grid grid grid__col_3">
          <span>
            <label for="access">Update in access</label>
            <input
              name="access"
              type="checkbox"
              bind:checked={shouldUpdateInAccess}
            />
          </span>
          <span>
            <label for="preservation">Update in preservation</label>
            <input
              name="preservation"
              type="checkbox"
              bind:checked={shouldUpdateInPreservation}
            />
          </span>
          {#if shouldUpdateInAccess || shouldUpdateInPreservation}
            <button class="primary">Update Descriptive Metadata Records</button>
          {/if}
        </div>
        <br />
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Label</th>
              <th>Value</th>
              <th>Access</th>
              <th>Preservation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
            <tr>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
              <td>value</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ScrollStepperStep>
  </ScrollStepper>
</div>

<style>
  .loading-wrap {
    margin: auto;
  }
  .depositor-grid,
  .loading-wrap {
    width: fit-content;
    margin-top: var(--perfect-fourth-4);
    margin-bottom: var(--perfect-fourth-4);
  }
  .update-wrap {
    min-height: 70rem;
  }
</style>
