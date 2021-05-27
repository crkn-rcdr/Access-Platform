<script>
    import DynamicDragAndDropList from "../shared/DynamicDragAndDropList.svelte";

    let canvases = [
        {
            id: "hi",
        },
        {
            id: "how",
        },
        {
            id: "are",
        },
        {
            id: "you",
        },
        {
            id: "doing",
        },
    ];
</script>

<div class="list">
    <DynamicDragAndDropList bind:dragList={canvases}>
        {#each canvases as canvas}
            <div>some content would be nice</div>
        {/each}
    </DynamicDragAndDropList>
</div>

<style>
    .list {
        width: 361px;
        background-color: rgb(240 240 240);
        height: 100%;
        overflow-y: auto;
    }

    .list div {
        height: 250px;
        width: 100%;
        background-color: rgb(235, 235, 235);
        margin: auto;
        margin-bottom: 24px;
    }

    .list div:nth-child(1) {
        margin-top: 24px;
    }
</style>
