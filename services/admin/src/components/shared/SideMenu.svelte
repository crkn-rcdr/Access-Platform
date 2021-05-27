<script>
    import { page } from "$app/stores";
    export let pages = [];
</script>

<nav class="sidemenu">
    <ul>
        {#each pages as pageInfo}
            <a href={pageInfo["link"]}>
                <li class="clickable" class:active={$page.path.includes(pageInfo["link"])}>
                    {pageInfo["title"]}
                </li>
            </a>
        {/each}
    </ul>
</nav>

<style>
    .sidemenu {
        background: var(--grey); /*#303232;*/ /*var(--teal);*/
        color:white;
        height: 100%;
        display: inline-block;
        width: 250px;
    }
    .sidemenu ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    .sidemenu a {
        text-decoration: none;
        color: rgb(223, 223, 223) !important;
    }
    .sidemenu li {
        background: rgba(255, 255, 255, 0.253);
        padding: 24px 72px 24px 72px;
    }
    .sidemenu li.active {
        background: rgba(255, 255, 255, 0.353);
        color: white !important;
    }
</style>
