<li class="side-menu-page-list-button clickable">
  <slot />
</li>

<style>
  li {
    background: rgba(0, 0, 0, 0.06);
    padding: var(--perfect-fourth-7) var(--perfect-fourth-4);
    cursor: pointer;
    font-weight: 500;
  }
  :global(.side-menu-page-list-button.active) {
    background: rgba(0, 0, 0, 0.02);
  }
</style>
