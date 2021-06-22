<li class="side-menu-page-list-button clickable">
  <slot />
</li>

<style>
  li {
    background: var(--grey);
    filter: brightness(1.1);
    padding: 24px 72px 24px 72px;
    color: var(--light-font) !important;
    cursor: pointer;
  }
  :global(.side-menu-page-list-button.active) {
    filter: brightness(1.2);
  }
</style>
