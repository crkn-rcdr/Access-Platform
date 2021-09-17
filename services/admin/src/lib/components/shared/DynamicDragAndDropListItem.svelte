<!--
@component
### Overview
An item to be dragged and dropped in a DynamicDragAndDropList.

### Properties
|    |    |    |
| -- | -- | -- |
| index: number    | required | The indexition of the drag and drop item in the the drag and drop container. |

### Usage
```  
<DynamicDragAndDropListItem bind:index={indexitionNumberVariable}>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*

-->
<script lang="ts">
  /**
   * @type {number} The indexition of the drag and drop item in the the drag and drop container.
   */
  export let index: number;

  /**
   * @type {HTMLDivElement} The html element containing the element(s) to drag and drop.
   */
  let container: HTMLDivElement;

  /**
   * @listens container
   * @listens index
   * @description Sets @var container's data-i attribute when the indexition changes.
   */
  $: if (container && typeof index !== "undefined")
    container.setAttribute("data-i", `${index}`);
</script>

<div bind:this={container} class="drop-list-item">
  <slot />
</div>
