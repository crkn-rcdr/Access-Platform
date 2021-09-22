<!--
@component
### Overview
An item to be dragged and dropped in a DynamicDragAndDropList.

### Properties
|    |    |    |
| -- | -- | -- |
| pos: number    | required | The position of the drag and drop item in the the drag and drop container. |

### Usage
```  
<DynamicDragAndDropListItem bind:pos={positionNumberVariable}>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*

-->
<script lang="ts">
  /**
   * @type {number} The position of the drag and drop item in the the drag and drop container.
   */
  export let pos: number;

  /**
   * @type {HTMLDivElement} The html element containing the element(s) to drag and drop.
   */
  let container: HTMLDivElement;

  //let item = {};

  /**
   * @listens container
   * @listens pos
   * @description Sets @var container's data-i attribute when the position changes.
   */
  $: if (container && typeof pos !== "undefined")
    container.setAttribute("data-i", `${pos - 1}`);
</script>

<div bind:this={container} class="drop-list-item">
  <slot />
</div>
