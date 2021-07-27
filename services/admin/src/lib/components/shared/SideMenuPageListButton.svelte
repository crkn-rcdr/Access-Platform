<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*

**Example two**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<li class="side-menu-page-list-button clickable">
  <slot />
</li>

<style>
  li {
    background: rgba(0, 0, 0, 0.06);
    padding: var(--perfect-fourth-7) var(--perfect-fourth-4);
    cursor: pointer;
    font-weight: 500;
  }
  :global(.side-menu-page-list-button.active) {
    background: rgba(0, 0, 0, 0.02);
  }
</style>
