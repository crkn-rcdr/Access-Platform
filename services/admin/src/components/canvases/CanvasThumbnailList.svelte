<script>
    import Align from "../shared/Align.svelte";
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
        {#each canvases as canvas, i}
            <div class="thumbnail">
                <Align vertical="flex-start">
                    <div class="actions-wrap">
                        <Align vertical="flex-start" direction="column">
                            <div class="action">
                                <input
                                    class="position-input"
                                    type="number"
                                    value={i + 1}
                                    name="position"
                                />
                            </div>
                            <div class="action">copy</div>
                            <div class="action">add after</div>
                            <div class="action">trash</div>
                        </Align>
                    </div>
                    <div class="image-wrap">
                        some content would be nice {canvas["id"]}
                    </div>
                </Align>
            </div>
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

    .thumbnail {
        height: 250px;
        width: 100%;
        background-color: rgb(235, 235, 235);
        margin: auto;
        margin-bottom: 24px;
    }

    .thumbnail:nth-child(1) {
        margin-top: 24px;
    }

    .actions-wrap {
        flex: 1;
        margin-left: 24px;
    }

    .actions-wrap .action {
        margin-bottom: 0.5em;
    }

    .image-wrap {
        flex: 9;
        text-align: center;
        margin-left: 12px;
    }

    .actions-wrap,
    .image-wrap {
        margin-top: 24px;
    }

    .position-input {
        width: 24px;
    }
</style>
