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
    background: rgba(0, 0, 0, 0.06);
    padding: var(--perfect-fourth-7) var(--perfect-fourth-4);
    cursor: pointer;
    font-weight: 500;
  }
  :global(.side-menu-page-list-button.active) {
    background: rgba(0, 0, 0, 0.02);
  }
</style>
