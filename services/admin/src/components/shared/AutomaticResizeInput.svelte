<script>
    import { onMount } from "svelte";

    export let type = "text";
    export let name;
    export let value;

    let input;

    function resizeInput() {
        input.style.width = `${input.value.length}.5em`;
    }

    onMount(() => {
        resizeInput();
        input.addEventListener("keyup", resizeInput);
    });
</script>

<input bind:this={input} {type} {name} {value} />
