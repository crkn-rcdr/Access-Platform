<script>
    import Align from "../shared/Align.svelte";

</script>

<div class="backdrop">
    <Align direction="column">
        <div id="label">
            <label>Canvas Label</label>
            <textarea rows="9">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet suscipit risus. Mauris commodo felis ut tortor luctus, id lobortis nibh lobortis. Ut mattis congue elit, a posuere est facilisis vitae. Duis consectetur sit amet augue eu rhoncus. Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.</textarea>
        </div>
        <a id="takedown">
            Take this canvas off of the platform ico
        </a>
    </Align>
</div>

<style>
    .backdrop {
        width: 319px;
        height: 100%;
        /*background-color: rgb(240 240 240);*/
        color: white;
        background-color: #242525;
    }
    #label {
        flex: 9;  
        width: 273px;
        margin:auto;
        padding-top:24px;
    }
    textarea {
        width: 93%;
    }
    #takedown {
        padding: 24px;
        font-size:16px;
        font-style: italic;
    }
</style>
