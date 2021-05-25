<script>
    import { page } from "$app/stores";
    export let pages = [];
</script>

<nav class="sidemenu">
    <ul>
        {#each pages as pageInfo}
            <a href={pageInfo["link"]}>
                <li class:active={$page.path.includes(pageInfo["link"])}>
                    {pageInfo["title"]}
                </li>
            </a>
        {/each}
    </ul>
</nav>

<style>
    .sidemenu {
        background: rgb(202, 202, 202);
        height: 100%;
        display: inline-block;
    }
    .sidemenu ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    .sidemenu a {
        text-decoration: none;
        color: black !important;
    }
    .sidemenu li {
        background: rgb(228, 228, 228);
        padding: 24px 72px 24px 72px;
    }
    .sidemenu li.active {
        background: rgb(241, 241, 241);
    }
    .sidemenu li:hover {
        background: rgb(245, 245, 245) !important;
    }
</style>
