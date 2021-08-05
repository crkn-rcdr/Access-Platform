<script>
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
      content_type: "",
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
  <ScrollStepperStep title="Metadata file">
    <div slot="icon">1</div>
    <div>
      <div>
        Select depositor:
        <DmdPrefixSelector bind:prefix={depositor} />
      </div>

      <br />
      <div>
        Select type:
        <select bind:value={mdtype}>
          <option value="" />
          <option value="issueinfocsv">Issueinfo CSV</option>
          <option value="dccsv">Dublin Core CSV</option>
          <option value="marc490">MARC - ID in 490</option>
          <option value="marcoocihm">MARC - ID in oocihm interpretation</option>
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
    </div>
  </ScrollStepperStep>

  <ScrollStepperStep title="Initiate Split">
    <div slot="icon">2</div>
    {#if myattachment}
      <table>
        <tr>
          <td>Name</td>
          <td>{mdname}</td>
        </tr>
        <tr>
          <td>Length</td>
          <td>{myattachment.length}</td>
        </tr>
        <tr>
          <td>Content Type</td>
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
      Initiate Split
    </button>
  </ScrollStepperStep>

  <ScrollStepperStep title="Split task" isLastStep={true}>
    <div slot="icon">3</div>
    {#if mydoc && "split" in mydoc}
      <table>
        {#if "requestDate" in mydoc.split}
          <tr>
            <td>Request Date</td>
            <td>{mydoc.split.requestDate}</td>
          </tr>
        {/if}
        {#if "succeeded" in mydoc.split}
          <tr>
            <td>Success?</td>
            <td>{mydoc.split.succeeded ? "Yes" : "No"}</td>
          </tr>
        {/if}
        {#if mydoc.split.message !== ""}
          <tr>
            <td>Message</td>
            <td class="message">{mydoc.split.message}</td>
          </tr>
        {/if}
        {#if "processDate" in mydoc.split}
          <tr>
            <td>Process Date</td>
            <td>{mydoc.split.processDate}</td>
          </tr>
        {/if}
      </table>
    {/if}
    <br />

    {#if myitems}
      <table>
        <caption>Metadata records found</caption>
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
    <br />
    <table>
      {#if depositor}
        <tr>
          <td>Depositor</td>
          <td>{depositor}</td>
        </tr>
      {/if}
      {#if mdtype}
        <tr>
          <td>Metadata type</td>
          <td>{mdtype}</td>
        </tr>
      {/if}
      {#if mydoc && mydoc._rev}
        <tr>
          <td>Revision</td>
          <td>{mydoc._rev}</td>
        </tr>
      {/if}
    </table>
  </ScrollStepperStep>
</ScrollStepper>

<style>
  td.message {
    word-wrap: break-word;
  }
</style>
