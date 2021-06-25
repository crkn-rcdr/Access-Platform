<nav class="sidemenu">
  <ul>
    <slot />
  </ul>
</nav>

<style>
  .sidemenu {
    background: var(--grey);
    color: var(--light-font);
    height: 100%;
    flex: 1.5;
  }
  .sidemenu ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
</style>
