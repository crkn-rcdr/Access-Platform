<!--
@component
### Overview
This component shows a progress bar to the user

### Properties
|    |    |    |
| -- | -- | -- |
| progress : number  | optional | The current progress in percentage of the progress bar. |
| progressText : string | optional | The text to be displayed beside the procress percentage after the progress bar. |

### Usage
```
<ProgressBar
  progress={50}
  progressText="loading..."
/>
```
-->
<script lang="ts">
  /**
   * @type { number } The current progress in percentage of the progress bar
   */
  export let progress: number = 0;

  /**
   * @type { string } The text to be displayed beside the procress percentage after the progress bar
   */
  export let progressText: string = "";
</script>

<div class="progress-wrap auto-align auto-align__a-center">
  <div class="backdrop">
    <div class="progress-bar" style={`width:${progress}%`} />
  </div>
  <span>{progress}% {progressText}</span>
</div>

<style>
  .progress-wrap {
    width: 100%;
  }

  .backdrop {
    background-color: var(--backdrop-bg);
    width: 100%;
    height: var(--perfect-fourth-7);
    border-radius: 1rem;
    flex: 9;
  }

  .progress-bar {
    background-color: var(--success);
    height: 100%;
    border-radius: 1rem;
  }

  span {
    margin-left: 1rem;
  }
</style>
