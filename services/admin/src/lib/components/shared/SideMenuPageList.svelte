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

<!--div class="list-group">
	<a href="#" class="list-group-item list-group-item-action active" aria-current="true">
		The current link item
	</a>
	<a href="#" class="list-group-item list-group-item-action">A second link item</a>
	<a href="#" class="list-group-item list-group-item-action">A third link item</a>
	<a href="#" class="list-group-item list-group-item-action">A fourth link item</a>
	<a class="list-group-item list-group-item-action disabled" aria-disabled="true"
		>A disabled link item</a
	>
</div-->

<nav class="sidemenu">
	<div class="list-group">
		<slot />
	</div>
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
