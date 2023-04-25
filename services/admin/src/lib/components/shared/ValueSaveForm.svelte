<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	/**
	 * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
	 */
	const dispatch = createEventDispatcher();

	export let value: any;
	export let saveDisabled: boolean = false;

	let previous: any;
	let initial: any;

	let showSave: boolean = false;

	function handleSavePressed() {
		dispatch('save', { value, previous });
		showSave = false;
		initial = value;
	}

	function handleCancelPressed() {
		value = initial;
		previous = initial;
		showSave = false;
	}

	$: {
		if (previous !== value) {
			if (typeof previous !== 'undefined') {
				dispatch('different', { value, previous });
				showSave = true;
			}
			previous = value;
		} else {
			showSave = false;
		}
	}

	onMount(() => {
		initial = value;
		previous = value;
	});
</script>

<div class="value-save-form-wrap">
	<div class="value-input-wrap">
		<slot />
	</div>
	{#if showSave}
		<div class="value-actions-wrap">
			<button class="btn save" on:click={handleSavePressed} disabled={saveDisabled}> Save </button>
			<button class="btn secondary" on:click={handleCancelPressed}>Cancel</button>
		</div>
	{/if}
</div>

<style>
	.value-save-form-wrap {
		width: 100%;
	}
	.value-input-wrap {
		margin-right: var(--margin-sm);
	}
	.value-actions-wrap {
		margin-top: var(--margin-sm);
	}
</style>
