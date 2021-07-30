<!--
@component
### Overview
The portion of the side menu container that contains a page controlled by the side menu.

### Properties
|    |    |    |
| -- | -- | -- |
| overflowX : string       | optional | A string value for the CSS overflow-x property. This will allow you to set the x axis scrolling behaviour for the page. |
| overflowY : string       | optional | A string value for the CSS overflow-x property. This will allow you to set the x axis scrolling behaviour for the page.  |
         
### Usage
```  
<SideMenuContainer>
  <SideMenuPageList>
    <SideMenuPageListButton/>
  </SideMenuPageList>
  <SideMenuBody>
    <SideMenuPage overflowX={"hidden"} overflowY={"hidden"}>
    </SideMenuPage>
  </SideMenuBody>
</SideMenuContainer>
```

*Note: see [Overflow CSS documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow) for more information.*
-->
<script>
  /**
   * @type {string} Slug being resolved.
   */
  export let overflowX = "auto";

  /**
   * @type {string} Slug being resolved.
   */
  export let overflowY = "auto";
</script>

<div
  class="side-menu-page"
  style="
      overflow-x: {overflowX};
      overflow-y: {overflowY};"
>
  <slot />
</div>

<style>
  .side-menu-page {
    height: 100%;
    width: 100%;
  }
</style>
