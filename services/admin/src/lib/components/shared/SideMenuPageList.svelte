<!--
@component
### Overview
The portion of the side menu container that contains the list of buttons for the list pages available in the side menu. When the user presses a button, the associated page displays in the SideMenuBody.

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
<nav class="sidemenu">
  <ul>
    <slot />
  </ul>
</nav>

<style>
  .sidemenu {
    background: var(--sidemenu-bg);
    /*filter: brightness(0.95);*/
    min-height: 100%;
    flex: 1.5;
    padding: var(--margin-sm) var(--perfect-fourth-6);
    width: fit-content;
  }
  .sidemenu ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
</style>
