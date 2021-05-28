<script>
    import { onMount } from "svelte";

    export let type = "text";
    export let name;
    export let value;

    let input;

    function resizeInput() {
        input.style.width = `${input.value.length}.9em`;
    }

    onMount(() => {
        resizeInput();
        input.addEventListener("keyup", resizeInput);
        input.addEventListener("change", resizeInput);
    });
</script>

<input bind:this={input} {type} {name} {value} />
