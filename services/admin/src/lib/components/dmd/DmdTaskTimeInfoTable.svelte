<script>
  export let dmdTask;
</script>

<div class="dmd-request-info">
  <span>Request inititated:</span>
  <span>{dmdTask?.["updated"]}</span>
  <span>Request updated:</span>
  <span>{dmdTask?.["process"]?.["requestDate"]}</span>
</div>

<style>
  .dmd-request-info {
    width: fit-content;
    display: inline-grid;
    display: grid;
    grid-template-areas: "a a";
    gap: 2rem;
    align-items: center;
    margin-top: var(--perfect-fourth-4);
    margin-bottom: var(--perfect-fourth-4);
  }
</style>
