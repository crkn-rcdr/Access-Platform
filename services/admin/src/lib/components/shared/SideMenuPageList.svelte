<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<nav class="sidemenu">
  <ul>
    <slot />
  </ul>
</nav>

<style>
  .sidemenu {
    background: var(--structural-div-bg);
    filter: brightness(0.95);
    height: 100%;
    flex: 1.5;
  }
  .sidemenu ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
</style>
