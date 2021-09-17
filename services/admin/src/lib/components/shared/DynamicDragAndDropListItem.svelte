<!--
@component
### Overview
An item to be dragged and dropped in a DynamicDragAndDropList.

### Properties
|    |    |    |
| -- | -- | -- |
<<<<<<< HEAD
| index: number    | required | The indexition of the drag and drop item in the the drag and drop container. |

### Usage
```  
<DynamicDragAndDropListItem bind:index={indexitionNumberVariable}>
=======
| pos: number    | required | The position of the drag and drop item in the the drag and drop container. |

### Usage
```  
<DynamicDragAndDropListItem bind:pos={positionNumberVariable}>
>>>>>>> main
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*

-->
<script lang="ts">
  /**
<<<<<<< HEAD
   * @type {number} The indexition of the drag and drop item in the the drag and drop container.
   */
  export let index: number;
=======
   * @type {number} The position of the drag and drop item in the the drag and drop container.
   */
  export let pos: number;
>>>>>>> main

  /**
   * @type {HTMLDivElement} The html element containing the element(s) to drag and drop.
   */
  let container: HTMLDivElement;

  /**
   * @listens container
<<<<<<< HEAD
   * @listens index
   * @description Sets @var container's data-i attribute when the indexition changes.
   */
  $: if (container && typeof index !== "undefined")
    container.setAttribute("data-i", `${index}`);
=======
   * @listens pos
   * @description Sets @var container's data-i attribute when the position changes.
   */
  $: if (container && typeof pos !== "undefined")
    container.setAttribute("data-i", `${pos - 1}`);
>>>>>>> main
</script>

<div bind:this={container} class="drop-list-item">
  <slot />
</div>
