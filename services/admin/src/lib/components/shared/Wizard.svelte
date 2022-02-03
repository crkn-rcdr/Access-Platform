<!--
@component
### Overview
This component displays a wizard-like view used on the smelter and dmd pages.

### Properties
|    |    |    |
| -- | -- | -- |
| title: string | optional | A title to tell the user what the wizard is trying to accomplish |
| size: "md" or "lg" | optional | How big the wizard should be |

### Usage
```
<Wizard title="Smelter" size="lg">
  ...content
</Wizard>
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  /**
   * @type {string} 1A title to tell the user what the wizard is trying to
   */
  export let title: string = "";

  /**
   * @type {"md" | "lg"} How big the wizard should be
   */
  export let size: "md" | "lg" = "md";
</script>

<div class="backdrop">
  <div class={`wrapper ${size}`}>
    <div class="title">
      <p>{title}</p>
    </div>
    <div class="form">
      <slot />
    </div>
  </div>
</div>

<style>
  .backdrop {
    padding: var(--perfect-fourth-4);
    background: var(--wizard-bg); /*var(--color-gradient);*/
    height: 100%;
    min-height: calc(100vh - 7.5rem);
  }
  .form {
    background: var(--base-bg);
    height: 100%;
    min-height: 52rem;
    border-radius: var(--border-radius);
    padding: var(--perfect-fourth-4);
    position: relative;
  }
  p {
    color: var(--secondary);
    margin-bottom: var(--margin-sm) !important;
  }
</style>
