<!--
@component
### Overview
A solid title/header component to break apart your pages into sections.

### Properties
|    |    |    |
| -- | -- | -- |
| title : string    | optional | The title text to display in the toolbar |

### Usage
```  
<Toolbar title={"Hello world"}>
  <div>
    <button>action button</button>
  </div>
</Toolbar>
```
-->
<script lang="ts">
  /**
   * @type {string} The title text to display in the toolbar.
   */
  export let title = "";
</script>

<div class="toolbar">
  <div class="auto-align auto-align__full auto-align auto-align__a-center">
    <h5>{title}</h5>
    <div class="toolbar-content">
      <slot />
    </div>
  </div>
</div>

<style>
  .toolbar {
    background-color: var(--structural-div-bg);
    padding: 0.75rem 2rem;
    width: 100%;
    height: 100%;
  }
  h5 {
    margin: 0 !important;
    display: inline;
    flex: 6;
  }
  .toolbar-content {
    flex: 3;
    text-align: right;
  }
</style>
