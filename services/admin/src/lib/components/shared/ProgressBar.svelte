<script lang="ts">
  export let progress = 0;
  export let progressText = "";
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
