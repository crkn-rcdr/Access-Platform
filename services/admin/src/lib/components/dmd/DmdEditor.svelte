<script lang="ts">
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  import FaTimesCircle from "svelte-icons/fa/FaTimesCircle.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import DmdFileSpecification from "$lib/components/dmd/DmdFileSpecification.svelte";
  import DmdFileConfirmation from "$lib/components/dmd/DmdFileConfirmation.svelte";
  import DmdTaskResults from "./DmdTaskResults.svelte";

  let depositorPrefix = undefined, // step 1
    metadataType = undefined, // step 2
    metadataFile = undefined; // set in upload file

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

  let activeStepIndex = 0;
</script>

<ScrollStepper bind:activeStepIndex>
  <ScrollStepperStep title="Enter File Information">
    <div slot="icon">1</div>
    <DmdFileSpecification
      bind:depositorPrefix
      bind:metadataType
      bind:metadataFile
      on:fileSelected={(e) => {
        console.log(e);
        activeStepIndex = 1;
      }}
    />
  </ScrollStepperStep>

  <ScrollStepperStep title="Review & Load Content">
    <div slot="icon">2</div>
    <DmdFileConfirmation
      bind:dmdTask
      on:confirm={() => {
        console.log("Sumbit");
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
          },
        ];
      }}
    />
  </ScrollStepperStep>

  <ScrollStepperStep
    title="DMD Task results"
    status={!dmdTask?.["split"]
      ? "neutral"
      : dmdTask?.["split"]?.["succeeded"]
      ? "success"
      : "fail"}
    isLastStep={true}
  >
    <div
      slot="icon"
      class="auto-align auto-align__j-center auto-align__a-center s-9immjC5o-rnn"
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
    <DmdTaskResults bind:depositorPrefix bind:metadataType bind:dmdTask />
  </ScrollStepperStep>
</ScrollStepper>
