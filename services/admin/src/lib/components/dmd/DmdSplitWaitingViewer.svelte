<script>
  import DmdTaskTimeInfoTable from "$lib/components/dmd/DmdTaskTimeInfoTable.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  export let dmdTask;
</script>

<div class="hero hero__gradient full-page">
  <div class="wrapper">
    <br />
    <br />
    <br />
    <div class="auto-align auto-align__block auto-align__j-center">
      <Loading />
    </div>
    <br />
    <div
      class="auto-align auto-align__block auto-align__column auto-align__a-center"
    >
      <h6>Please wait while your DMD Task is processing...</h6>
      <DmdTaskTimeInfoTable {dmdTask} />
    </div>
  </div>
</div>
