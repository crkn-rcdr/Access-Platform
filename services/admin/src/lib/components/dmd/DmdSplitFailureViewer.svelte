<script>
  import DmdTaskTimeInfoTable from "$lib/components/dmd/DmdTaskTimeInfoTable.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

  export let dmdTask;
  export let message;
</script>

<div class="hero hero__gradient full-page failure">
  <div class="wrapper">
    <div
      class="auto-align auto-align__block auto-align__column auto-align__a-center"
    >
      <h6>DMD Task Failed!</h6>
      <NotificationBar {message} status="fail" />
      <DmdTaskTimeInfoTable {dmdTask} />
      <a href="/dmd/new" class="dmd-task-try-again">
        <button class="danger">Try Again</button>
      </a>
    </div>
  </div>
</div>

<style>
  .dmd-task-try-again {
    margin-top: var(--perfect-fourth-4);
    margin-bottom: var(--perfect-fourth-4);
  }
  .failure {
    filter: hue-rotate(207deg);
  }
  .failure > * {
    filter: hue-rotate(-207deg);
  }
</style>
