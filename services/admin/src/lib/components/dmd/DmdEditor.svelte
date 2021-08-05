<script>
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  import FaTimesCircle from "svelte-icons/fa/FaTimesCircle.svelte";
  import DmdPrefixSelector from "$lib/components/dmd/DmdPrefixSelector.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import FileSelector from "../shared/FileSelector.svelte";

  export let id = undefined;

  let depositor = undefined, // step 1
    mdtype = undefined, // step 2
    metadatafile = undefined, // set in upload file
    mdname = "A name", // set in update local/update
    mydoc = {
      _rev: "123",
      split: {
        message: "test",
        succeeded: true,
        processDate: "",
      },
    }, // set in update local/update
    myattachment = {
      // set in update local/update
      content_type: "a type",
      data: "", // .optional(),
      digest: "",
      encoded_length: 123, //.optional(),
      encoding: "", //.optional(),
      length: 1, //.optional(),
      revpos: 2,
      stub: false, //.optional(),
    },
    myitems = [
      {
        id: "",
        accessidfound: true,
        preservationidfound: true,
        validated: true,
        message: "",
        pubmin: "",
        pubmax: "",
      },
    ];

  let activeStepIndex = 0;
</script>

<ScrollStepper bind:activeStepIndex>
  <ScrollStepperStep title="Enter Task Information">
    <div slot="icon">1</div>
    <div>
      <DmdPrefixSelector bind:prefix={depositor} />
      <br />
      <br />
      <fieldset>
        <legend>Metadata file information</legend>
        <div>
          Select type:
          <select name="metadata-type" bind:value={mdtype}>
            <option value="" />
            <option value="issueinfocsv">Issueinfo CSV</option>
            <option value="dccsv">Dublin Core CSV</option>
            <option value="marc490">MARC - ID in 490</option>
            <option value="marcoocihm"
              >MARC - ID in oocihm interpretation</option
            >
            <option value="marcooe">MARC - ID in ooe interpretation</option>
          </select>
        </div>
        <br />
        <FileSelector
          on:change={(e) => {
            //uploadFile();
            console.log("uploadFile", e);
            activeStepIndex = 1;
          }}
        />
      </fieldset>
    </div>
  </ScrollStepperStep>

  <ScrollStepperStep title="Review & Initiate Task">
    <div slot="icon">2</div>
    {#if myattachment}
      <table>
        <tr>
          <td><b>Name</b></td>
          <td>{mdname}</td>
        </tr>
        <tr>
          <td><b>Length</b></td>
          <td>{myattachment.length}</td>
        </tr>
        <tr>
          <td><b>Content Type</b></td>
          <td>{myattachment.content_type}</td>
        </tr>
      </table>
    {/if}
    <br />
    <button
      class="button primary"
      type="submit"
      on:click={() => {
        console.log("Sumbit");
        activeStepIndex = 2;
      }}
    >
      Initiate Task
    </button>
  </ScrollStepperStep>

  <ScrollStepperStep title="Task results" isLastStep={true}>
    <div
      slot="icon"
      class="auto-align auto-align__j-center auto-align__a-center s-9immjC5o-rnn"
    >
      {#if mydoc && "split" in mydoc && "succeeded" in mydoc.split}
        {#if mydoc.split.succeeded}
          <FaCheckCircle />
        {:else}
          <FaTimesCircle />
        {/if}
      {:else}
        3
      {/if}
    </div>
    {#if mydoc && "split" in mydoc}
      <table>
        {#if "succeeded" in mydoc.split}
          <tr>
            <td><b>Success?</b></td>
            <td>{mydoc.split.succeeded ? "Yes" : "No"}</td>
          </tr>
        {/if}
        {#if mydoc.split.message !== ""}
          <tr>
            <td><b>Message</b></td>
            <td class="message">{mydoc.split.message}</td>
          </tr>
        {/if}
        {#if "requestDate" in mydoc.split}
          <tr>
            <td><b>Request Date</b></td>
            <td>{mydoc.split.requestDate}</td>
          </tr>
        {/if}
        {#if "processDate" in mydoc.split}
          <tr>
            <td><b>Process Date</b></td>
            <td>{mydoc.split.processDate}</td>
          </tr>
        {/if}
        {#if mydoc && mydoc._rev}
          <tr>
            <td><b>Revision</b></td>
            <td>{mydoc._rev}</td>
          </tr>
        {/if}
        {#if depositor}
          <tr>
            <td><b>Depositor</b></td>
            <td>{depositor}</td>
          </tr>
        {/if}
        {#if mdtype}
          <tr>
            <td><b>Metadata type</b></td>
            <td>{mdtype}</td>
          </tr>
        {/if}
      </table>
    {/if}
    <br />
    {#if myitems}
      <table>
        <caption><b>Metadata records found</b></caption>
        {#each myitems as item}
          <tr>
            <td>{item.id ? item.id : "[not found]"}</td>
            <td>{item.accessidfound ? item.accessidfound : "[not found]"}</td>
            <td>
              {item.preservationidfound
                ? item.preservationidfound
                : "[not found]"}
            </td>
            <td>{item.validated ? "Yes" : "No"}</td>
            <td>{item.message ? item.message : ""}</td>
            <td>{item.pubmin ? item.pubmin : ""}</td>
            <td>{item.pubmax ? item.pubmax : ""}</td>
            <td>Copy2access</td>
            <td>copy2preservation</td>
          </tr>
        {/each}
      </table>
    {/if}
  </ScrollStepperStep>
</ScrollStepper>

<style>
  td.message {
    word-wrap: break-word;
  }
  select {
    width: 100%;
  }
</style>
