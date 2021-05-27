<script>
    import DynamicDragAndDropList from "../shared/DynamicDragAndDropList.svelte";

    let canvases = [
        {
            id: "1",
        },
        {
            id: "2",
        },
        {
            id: "3",
        },
        {
            id: "4",
        },
        {
            id: "5",
        },
    ];
</script>

<div class="list">
    <DynamicDragAndDropList bind:dragList={canvases}>
        {#each canvases as canvas}
            <div>some content would be nice {canvas["id"]}</div>
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
