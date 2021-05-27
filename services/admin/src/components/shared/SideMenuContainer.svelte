<script>
    import SideMenu from "../../components/shared/SideMenu.svelte";
    import Align from "../../components/shared/Align.svelte";

    export let pages = [];
</script>
<Align vertical="stretch">
    <span>
        <SideMenu {pages} />
    </span>
    <div class="content">
        <slot />
    </div>
</Align>

<style>
    .content {
        flex: 9;
    }
</style>