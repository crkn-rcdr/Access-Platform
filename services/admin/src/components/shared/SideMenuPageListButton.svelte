<li class="side-menu-page-list-button clickable">
  <slot />
</li>

<!--class:active={$page.path.includes(pageInfo["link"])}-->
<style>
  li {
    background: rgba(255, 255, 255, 0.253);
    padding: 24px 72px 24px 72px;
    color: rgb(223, 223, 223) !important;
    cursor: pointer;
  }
  :global(.side-menu-page-list-button.active) {
    background: rgba(255, 255, 255, 0.353);
    color: white !important;
  }
</style>
