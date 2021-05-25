<script>
    import Align from "../../../components/shared/Align.svelte";
    import CanvasLabelEditor from "../../../components/canvases/CanvasLabelEditor.svelte";
    import CanvasViewer from "../../../components/canvases/CanvasViewer.svelte";
    import ThumbnailList from "../../../components/shared/ThumbnailList.svelte";
</script>

<Align>
    <div>
        <ThumbnailList />
    </div>
    <div>
        <CanvasViewer />
    </div>
    <div>
        <CanvasLabelEditor />
    </div>
</Align>
