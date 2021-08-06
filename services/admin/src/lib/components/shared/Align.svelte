<!--
@component
### Overview
A wrapper component allowing the developer to use the display:flex options in a cleaner way.

### Properties
|    |    |    |
| -- | -- | -- |
| display : string (inline-flex or flex)    | optional | The CSS display property value |
| horizontal : string                       | optional | The CSS justify-content property value |
| vertical : string                         | optional | The CSS align-items property value |
| direction : string                        | optional | The CSS flex-direction property value |

### Usage
```  
<Align ...props>
  Content
  Goes 
  Here
</Align>
```
*Note: see [flexbox documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox)*
-->
<script lang="ts">
  /**
   * @type {string} Slug being resolved.
   */
  export let display: "inline-flex" | "flex" = "inline-flex";

  /**
   * @type {string} Slug being resolved.
   */
  export let horizontal = "flex-start";

  /**
   * @type {string} Slug being resolved.
   */
  export let vertical = "flex-start";

  /**
   * @type {string} Slug being resolved.
   */
  export let direction = "row";
</script>

<div
  class="align"
  style="
        display: {display};
        justify-content: {horizontal}; 
        align-items: {vertical};
        flex-direction: {direction};"
>
  <slot />
</div>

<style>
  .align {
    width: 100%;
    height: 100%;
  }
</style>
