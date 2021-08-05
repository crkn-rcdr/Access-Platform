<script>
  import DmdPrefixSelector from "$lib/components/dmd/DmdPrefixSelector.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";

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
  <ScrollStepperStep>
    <fieldset>
      <legend>Metadata file</legend>

      <legend>
        Select depositor:
        <DmdPrefixSelector bind:prefix={depositor} />
      </legend>

      <legend>
        Select type:
        <select bind:value={mdtype}>
          <option value="" />
          <option value="issueinfocsv">Issueinfo CSV</option>
          <option value="dccsv">Dublin Core CSV</option>
          <option value="marc490">MARC - ID in 490</option>
          <option value="marcoocihm">MARC - ID in oocihm interpretation</option>
          <option value="marcooe">MARC - ID in ooe interpretation</option>
        </select>
      </legend>

      <legend>
        Upload file:
        <input
          type="file"
          id="upload"
          name="upload"
          on:change={() => {
            //uploadFile();
            console.log("uploadFile");
            activeStepIndex = 1;
          }}
        />
      </legend>
    </fieldset>
  </ScrollStepperStep>

  <ScrollStepperStep>
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
    <p>
      <button
        type="submit"
        on:click={() => {
          console.log("Sumbit");
          activeStepIndex = 2;
        }}
      >
        Initiate Split
      </button>
    </p>
  </ScrollStepperStep>

  <ScrollStepperStep>
    <br />
    {#if mydoc && "split" in mydoc}
      <fieldset>
        <legend>Split task</legend>
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
      </fieldset>
    {/if}
    <br />

    {#if myitems}
      <fieldset>
        <legend>Metadata records found</legend>
        <table>
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
      </fieldset>
    {/if}
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
