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

  let depositorPrefix = "";
  let metadataType = "";
  let metadataFile: File | undefined = undefined;

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
  };

  // Attachment: { data?: string; length?: number; encoded_length?: number; encoding?: string; stub?: boolean; content_type: string; digest: string; revpos: number; }

  let activeStepIndex = 0,
    furthestStepVisitedIndex = 0;

  function resetForm() {
    depositorPrefix = "";
    metadataType = "";
    metadataFile = undefined;
    dmdTask = {
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
    };
  }
</script>

<ScrollStepper bind:activeStepIndex bind:furthestStepVisitedIndex>
  <ScrollStepperStep title="Enter DMD Task Information">
    <div slot="icon">1</div>
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
  </ScrollStepperStep>

  <ScrollStepperStep
    title="Review Selections & Inititate Metadata File Processing"
  >
    <div slot="icon">2</div>
    <b>Depositor Prefix: </b><span
      >{depositorPrefix ? depositorPrefix : "No Prefix"}</span
    >
    <br />
    <br />
    <b>Metadata Type: </b><span>{metadataType}</span>
    <br />
    <br />
    <DmdFileConfirmation
      bind:metadataFile
      on:process={() => {
        //TODO: file and metadata type must be defined
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
      on:cancel={() => {
        console.log("cancel");
        activeStepIndex = 0;
        furthestStepVisitedIndex = 0;
        resetForm();
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
