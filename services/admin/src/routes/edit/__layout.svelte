<script>
    // TODO: Is this the best way to implement global styling?
    import "../../app.css";

    import { page } from "$app/stores";
    const { noid } = $page.params;

    import Align from "../../components/shared/Align.svelte";
    import SideMenu from "../../components/shared/SideMenu.svelte";
    import Toolbar from "../../components/shared/Toolbar.svelte";

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

<div>
    <Toolbar title="oocihm.8_06842_6">
        <button class="primary">Save</button>
        <button class="secondary">Publish</button>
    </Toolbar>

    <Align vertical="stretch">
        <div>
            <SideMenu {pages} />
        </div>
        <div>
            <slot />
        </div>
    </Align>
</div>

<style>
    div {
        width: 1483px;
    }
</style>
