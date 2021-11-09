<!--
@component
### Overview
The portion of the side menu container that contains the pages controlled by the side menu.

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
<div class="side-menu-body">
  <slot />
</div>

<style>
  .side-menu-body {
    height: 100%;
    width: 100%;
    flex: 8.5;
    background: var(--light-bg);
  }
</style>
