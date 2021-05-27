<script>
    export let horizontal = "flex-start";
    export let vertical = "flex-start";
    export let direction = "row";
</script>

<div
    class="align"
    style="
        justify-content: {horizontal}; 
        align-items: {vertical};
        flex-direction: {direction};"
>
    <slot />
</div>

<style>
    .align {
        display: inline-flex;
        width: 100%;
        height: 100%;
    }
</style>
