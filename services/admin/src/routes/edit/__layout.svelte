<script>
    // TODO: Is this the best way to implement global styling?
    import "../../app.css";

    import { page } from "$app/stores";

    import Align from "../../components/shared/Align.svelte";
    import Toolbar from "../../components/shared/Toolbar.svelte";
    import SideMenuContainer from "../../components/shared/SideMenuContainer.svelte";

    const { noid } = $page.params;

    let pages = [
        {
            name: "info",
            title: "General Info",
            link: `/edit/info/${noid}`,
        },
        {
            name: "content",
            title: "Content",
            link: `/edit/content/${noid}`,
        },
    ];
</script>

<div class="editor">
    <Toolbar title="oocihm.8_06842_6">
        <Align direction="column">
            <span class="status">
                <label>Status: </label>
                <span>unpublished</span>
            </span>
            <span>
                <button class="save">Save</button>
                <button class="secondary">Publish</button>
            </span>
        </Align>
    </Toolbar>

    <SideMenuContainer {pages}>
        <slot />
    </SideMenuContainer>
</div>

<style>
    .editor {
        height: 734px;
        width: 1483px;
    }
    .status {
        margin-bottom: 4px;
        color: var(--grey);
    }
    .status label,
    .status span {
        font-size: 16px !important;
    }
</style>
