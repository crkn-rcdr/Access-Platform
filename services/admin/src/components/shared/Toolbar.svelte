<script>
    export let title = "";
</script>

<div class="toolbar">
    <h4>{title}</h4>
    <div class="end-content">
        <slot />
    </div>
</div>

<style>
    .toolbar {
        background-color: rgb(240, 240, 240);
        padding: 32px;
    }
    h4 {
        margin: 0;
        width: 500px;
        display: inline;
    }
    .end-content {
        float: right;
        margin-top: -8px;
    }
</style>
