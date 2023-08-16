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

<!--li class="nav-item side-menu-page-list-button"-->
<li class="side-menu-page-list-button list-group-item list-group-item-action">
	<slot />
</li>

<!--li class="nav-item">
  <a class="nav-link" href="#">Link</a>
</li-->

<style>
	li {
		padding: var(--perfect-fourth-8) var(--perfect-fourth-4);
		font-weight: 500;
		color: var(--sidemenu-font);
		margin-bottom: var(--margin-sm);
		border-radius: var(--border-radius);
		cursor: pointer;
	}
</style>
