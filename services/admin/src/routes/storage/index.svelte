<script>
  let objects = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
</script>

<div class="wrapper">
  <div class="hero hero__gradient full-bleed">
    <div class="wrapper">
      <h1>Storage</h1>
      <p>Manage the objects in storage</p>
    </div>
  </div>
  <br />
  <br />
  <div class="auto-grid">
    {#each objects as object}
      <div class="object">{object}</div>
    {/each}
  </div>
</div>

<style>
  .object {
    width: 10rem;
    height: 10rem;
    background-color: var(--grey);
    margin: auto;
  }
</style>
