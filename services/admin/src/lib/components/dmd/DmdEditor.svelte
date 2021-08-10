<script lang="ts">
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  import FaTimesCircle from "svelte-icons/fa/FaTimesCircle.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import DmdFileSpecification from "$lib/components/dmd/DmdFileSpecification.svelte";
  import DmdFileConfirmation from "$lib/components/dmd/DmdFileConfirmation.svelte";
  import DmdSplitTaskResults from "$lib/components/dmd/DmdSplitTaskResults.svelte";
  import DmdPrefixSelector from "$lib/components/dmd/DmdPrefixSelector.svelte";
  import DmdStoreTask from "./DmdStoreTask.svelte";

  let depositorPrefix = undefined, // step 1
    metadataType = undefined, // step 2
    metadataFile: File | undefined = undefined; // set in upload file

  let dmdTask: DMDTask = {
    user: {
      name: "Brittny Lapierre",
      email: "blapierre@crkn.ca",
    },
    id: "123",
    updated: 12345,
    attachments: {
      metadata: {
        data: "",
        length: 0,
        content_type: "text/csv", // @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        encoding: "",
        digest: "",
        revpos: 1,
      },
    },
    prefix: "oochim",
    mdType: "csvissueinfo", //"csvissueinfo" | "csvdc" | "marc490" | "marcoocihm" | "marcooe"
    store: {
      processDate: 1234,
      succeeded: false,
      message: "oops",
    },
  };

  // Attachment: { data?: string; length?: number; encoded_length?: number; encoding?: string; stub?: boolean; content_type: string; digest: string; revpos: number; }

  let activeStepIndex = 0;
</script>

<ScrollStepper bind:activeStepIndex>
  <ScrollStepperStep title="Create New Task">
    <div slot="icon">1</div>
    <div>
      <DmdPrefixSelector bind:prefix={depositorPrefix} />
      <br />
      <br />
      <DmdFileSpecification
        bind:metadataType
        bind:metadataFile
        on:fileSelected={() => {
          activeStepIndex = 1;
        }}
      />
    </div>
  </ScrollStepperStep>

  <ScrollStepperStep title="Review & Process Metadata File">
    <div slot="icon">2</div>
    <DmdFileConfirmation
      bind:metadataFile
      on:process={() => {
        activeStepIndex = 2;
        dmdTask["split"] = {
          requestDate: 12345,
          processDate: 123456,
          message: "a msg",
          succeeded: true,
        };
        dmdTask["items"] = [
          {
            id: "123456",
            splitResult: {
              message: "A msg",
              accessSlug: "oochim.12345",
              preservationId: "noid?",
              valid: true,
            },
            storeRequest: {
              message: "A msg",
              accessSlug: "oochim.12345",
              preservationId: "noid?",
              valid: true,
              access: true,
              preservation: false,
            },
          },
        ];
      }}
    />
  </ScrollStepperStep>

  <ScrollStepperStep
    title="Metadata File Processing Results"
    status={!dmdTask?.["split"]
      ? "neutral"
      : dmdTask?.["split"]?.["succeeded"]
      ? "success"
      : "fail"}
  >
    <div
      slot="icon"
      class="auto-align auto-align__j-center auto-align__a-center"
    >
      {#if dmdTask?.["split"]}
        {#if dmdTask?.["split"]?.["succeeded"]}
          <FaCheckCircle />
        {:else}
          <FaTimesCircle />
        {/if}
      {:else}
        3
      {/if}
    </div>
    <DmdSplitTaskResults
      bind:depositorPrefix
      bind:metadataType
      bind:dmdTask
      on:store={() => {
        activeStepIndex = 3;
      }}
    />
  </ScrollStepperStep>

  <ScrollStepperStep
    title="Store Processed Metadata into Access and/or Preservation"
    isLastStep={true}
  >
    <div
      slot="icon"
      class="auto-align auto-align__j-center auto-align__a-center"
    >
      4
    </div>
    <DmdStoreTask />
  </ScrollStepperStep>
</ScrollStepper>
