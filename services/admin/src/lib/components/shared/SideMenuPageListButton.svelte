<li class="side-menu-page-list-button clickable">
  <slot />
</li>

<style>
  li {
    background: var(--grey);
    filter: brightness(1.1);
    padding: var(--perfect-fourth-7) var(--perfect-fourth-4);
    color: var(--light-font) !important;
    cursor: pointer;
  }
  :global(.side-menu-page-list-button.active) {
    filter: brightness(1.2);
  }
</style>
