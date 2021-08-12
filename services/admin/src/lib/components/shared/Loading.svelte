<!--
@component
### Overview
This component shows a CRKN-esque loader to be used when an action is being performed.

### Properties
|    |    |    |
| -- | -- | -- |
| backgroundType: "light" or "dark" or "primary" or "secondary" or "gradient"    | optional | Sets the background colour of the lines in the loader. |

### Usage
```  
<Loader/>
```
-->
<script lang="ts">
  /**
   * @type {"light" | "dark" | "primary" | "secondary" | "gradient"} If the file selector should support selecting multiple files or not.
   */
  export let backgroundType:
    | "light"
    | "dark"
    | "primary"
    | "secondary"
    | "gradient" = "light";
</script>

<div class="loader auto-align auto-align__a-center">
  <div class={`line line__${backgroundType}`} />
  <div class={`line line__${backgroundType}`} />
  <div class={`line line__${backgroundType}`} />
</div>

<style>
  .loader {
    height: 4rem;
    width: fit-content;
  }
  .loader:last-child {
    margin-right: 0 !important;
  }
  .loader .line:nth-last-child(1) {
    animation: growShrink 2s 1s infinite;
  }
  .loader .line:nth-last-child(2) {
    animation: growShrink 2s 0.5s infinite;
  }
  .loader .line:nth-last-child(3) {
    animation: growShrink 2s 0s infinite;
  }
  .line {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 1rem;
    margin-right: var(--margin-sm);
  }
  .line__primary {
    background: var(--primary);
  }
  .line__secondary {
    background: var(--secondary);
  }
  .line__light {
    background: var(--light-font);
  }
  .line__dark {
    background: var(--dark-font);
  }
  .line__gradient {
    background: linear-gradient(
      40.79deg,
      var(--teal) -106.9%,
      var(--green) 93.69%
    );
  }
  @keyframes growShrink {
    0% {
      height: 1rem;
    }
    50% {
      height: 3rem;
    }
    100% {
      height: 1rem;
    }
  }
</style>
