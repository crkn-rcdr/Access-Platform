<nav class="sidemenu">
  <ul>
    <slot />
  </ul>
</nav>

<style>
  .sidemenu {
    background: var(--structural-div-bg);
    filter: brightness(0.95);
    height: 100%;
    flex: 1.5;
  }
  .sidemenu ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
</style>
