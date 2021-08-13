<script lang="ts">
  import type {
    FailedDMDTask,
    SucceededDMDTask,
    WaitingDMDTask,
  } from "@crkn-rcdr/access-data";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import TempPrefixSelector from "$lib/components/dmd/TempPrefixSelector.svelte";

  let prefix = "oocihm";
  let shouldUpdateInAccess = true;
  let shouldUpdateInPreservation = true;

  let activeStepIndex = 0;
  let hasLookupRan = false;
  let showLoader = false;

  export let dmdTask:
    | WaitingDMDTask
    | FailedDMDTask
    | SucceededDMDTask
    | undefined = {
    id: "123",
    updated: "1628785112",
    attachments: {
      // ...metadata file info
    },
    user: {
      email: "email",
      name: "name",
    }, //for now
    mdType: "marcooe",
    process: {
      requestDate: "1628785101",
      succeeded: true,
      message: "The process.message from the backend",
    },
    items: [
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
    ],
  };
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
              for (const item of dmdTask["items"]) {
                item["access"] = true;
                item["preservation"] = true;
              }
              dmdTask = dmdTask;
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
        <DmdItemsTable bind:dmdTask />
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
        <DmdItemsTable bind:dmdTask />
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
