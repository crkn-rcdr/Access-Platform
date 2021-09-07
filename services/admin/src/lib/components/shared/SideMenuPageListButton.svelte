<!--
@component
### Overview
The button for a pages available in the side menu. When the user presses a button, the associated page displays in the SideMenuBody.

### Properties
None
                   
### Usage
```  
<SideMenuContainer>
  <SideMenuPageList>
    <SideMenuPageListButton/>
  </SideMenuPageList>
  <SideMenuBody>
    <SideMenuPage>
    </SideMenuPage>
  </SideMenuBody>
</SideMenuContainer>
```
-->
<li class="side-menu-page-list-button clickable">
  <slot />
</li>

<style>
  li {
    padding: var(--perfect-fourth-8) var(--perfect-fourth-4);
    font-weight: 500;
    color: var(--secondary);
    margin-bottom: var(--margin-sm);
    border-radius: var(--border-radius);
  }
  li:not(.active):hover {
    background: rgba(255, 255, 255, 0.45);
    transition: background 0.5s ease;
  }
  :global(.side-menu-page-list-button.active) {
    background: rgba(255, 255, 255, 0.45);
    color: var(--primary);
  }
</style>
