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

  export let size: "sm" | "md" | "lg" = "md";
</script>

<div class={`loader ${size} auto-align auto-align__a-center`}>
  <div class={`line line__${backgroundType}`} />
  <div class={`line line__${backgroundType}`} />
  <div class={`line line__${backgroundType}`} />
</div>

<style>
  .loader {
    width: fit-content;
  }
  .loader.lg {
    height: 10rem;
  }
  .loader.md {
    height: 4rem;
  }
  .loader.sm {
    height: 1rem;
  }
  .loader:last-child {
    margin-right: 0 !important;
  }
  .loader.lg .line:nth-last-child(1) {
    animation: growShrinkLg 2s 1s infinite;
  }
  .loader.lg .line:nth-last-child(2) {
    animation: growShrinkLg 2s 0.5s infinite;
  }
  .loader.lg .line:nth-last-child(3) {
    animation: growShrinkLg 2s 0s infinite;
  }
  .loader.md .line:nth-last-child(1) {
    animation: growShrinkMd 2s 1s infinite;
  }
  .loader.md .line:nth-last-child(2) {
    animation: growShrinkMd 2s 0.5s infinite;
  }
  .loader.md .line:nth-last-child(3) {
    animation: growShrinkMd 2s 0s infinite;
  }
  .loader.sm .line:nth-last-child(1) {
    animation: growShrinkSm 2s 1s infinite;
  }
  .loader.sm .line:nth-last-child(2) {
    animation: growShrinkSm 2s 0.5s infinite;
  }
  .loader.sm .line:nth-last-child(3) {
    animation: growShrinkSm 2s 0s infinite;
  }

  .line {
    display: inline-block;
  }
  .loader.lg .line {
    width: 3rem;
    height: 3rem;
    border-radius: 3rem;
    margin-right: var(--margin-sm);
  }
  .loader.md .line {
    width: 1rem;
    height: 1rem;
    border-radius: 1rem;
    margin-right: var(--margin-sm);
  }
  .loader.sm .line {
    width: 0.2rem;
    height: 0.2rem;
    border-radius: 0.2rem;
    margin-right: 0.3rem;
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
  @keyframes growShrinkLg {
    0% {
      height: 3rem;
    }
    50% {
      height: 9rem;
    }
    100% {
      height: 3rem;
    }
  }
  @keyframes growShrinkMd {
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
  @keyframes growShrinkSm {
    0% {
      height: 0.2rem;
    }
    50% {
      height: 0.6rem;
    }
    100% {
      height: 0.2rem;
    }
  }
</style>
