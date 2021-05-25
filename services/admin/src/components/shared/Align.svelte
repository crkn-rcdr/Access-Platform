<script>
    export let horizontal = "flex-start";
    export let vertical = "flex-start";
</script>

<div
    class="align"
    style="justify-content: {horizontal}; align-items: {vertical}"
>
    <slot />
</div>

<style>
    .align {
        display: flex;
    }
</style>
