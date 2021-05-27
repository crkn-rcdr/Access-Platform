<script>
    import Align from "../../../components/shared/Align.svelte";
    import CanvasLabelEditor from "../../../components/canvases/CanvasLabelEditor.svelte";
    import CanvasViewer from "../../../components/canvases/CanvasViewer.svelte";
    import CanvasThumbnailList from "../../../components/canvases/CanvasThumbnailList.svelte";
</script>

<Align>
    <div>
        <CanvasThumbnailList />
    </div>
    <div>
        <CanvasViewer />
    </div>
    <div>
        <CanvasLabelEditor />
    </div>
</Align>

<style>
    div {
        height: 100%;
    }
</style>
