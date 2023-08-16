<!--
@component
### Overview
A component that overlays ontop of the application, in the center of the screen.
### Properties
|    |    |    |
| -- | -- | -- |
| open : boolean    | required | The state control for showing or hiding the custom-modal |
| title : string    | optional | The title text of the custom-modal. |
| size : "sm" or "md" or "lg"   | optional | The size setting for the custom-modal. |
### Usage
```  
<Modal
  bind:open={aBooleanVariable}
  title={"Do something"}
>
  <div slot="body">
    ...content
  </div>
  <div slot="footer">
    ... buttons
  </div>
</Modal>
```
*Note: `bind:` is required for changes to the object and its model to be reflected in higher level components.*
-->
<script lang="ts">
	import TiTimes from 'svelte-icons/ti/TiTimes.svelte';
	/**
	 * @type {boolean} The state control for showing or hiding the custom-modal.
	 */
	export let open = false;
	/**
	 * @type {string} The title text of the custom-modal.
	 */
	export let title = '';

	/**
	 * @type {"sm" | "md" | "lg"} The title text of the custom-modal.
	 */
	export let size: 'sm' | 'md' | 'lg' = 'sm';

	/**
	 * @type {HTMLDivElement} The container of the custom-modal.
	 */
	let container: HTMLDivElement;

	/**
	 * Disables scrolling on all of the parent components when the custom-modal is open. re-enables scrolling when the custom-modal is shut.
	 * @returns void
	 */
	function disableScrollingOnParents() {
		let parent = container.parentElement;
		while (parent) {
			if (open) {
				parent.classList.add('no-scroll'); //`height: 100%;overflow: hidden;`;
			} else {
				parent.classList.remove('no-scroll');
			}
			parent = parent.parentElement;
		}
	}

	/**
	 * @listens open
	 * @listens container
	 * @description Calls @function disableScrollingOnParents when @var open or @var container are updated.
	 */
	$: {
		open;
		if (container) {
			disableScrollingOnParents();
		}
	}
</script>

<svelte:body />
{#if open}
	<div
		bind:this={container}
		class="custom-modal-backdrop auto-align auto_align__full auto-align__a-center auto-align__j-center"
	>
		<div class={`custom-modal ${size}`}>
			<div class="custom-modal-inner">
				<div class="custom-modal-header auto-align">
					<h6>{title}</h6>
					<div
						class="action icon"
						on:click={() => {
							open = false;
						}}
					>
						<TiTimes />
					</div>
				</div>
				<div class="custom-modal-body">
					<slot name="body" />
				</div>
				<div class="custom-modal-footer auto-align auto-align__a-end auto-align__j-end">
					<slot name="footer" />
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.custom-modal-backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		height: 100vh;
		width: 100vw;
		background-color: var(--overlay-bg);
		z-index: 2;
	}
	.custom-modal {
		position: relative;
		background-color: var(--base-bg);
		text-align: left;
	}
	.custom-modal.sm {
		width: 50rem;
		max-width: 100%;
		height: 25rem;
		max-height: 100%;
	}
	.custom-modal.md {
		width: 65rem;
		max-width: 100%;
		height: 50rem;
		max-height: 100%;
	}
	.custom-modal.lg {
		width: 85rem;
		max-width: 100%;
		height: 75rem;
		max-height: 100%;
	}
	.custom-modal-inner {
		display: grid;
		grid-template-areas:
			'header'
			'body'
			'footer';
		grid-template-rows: var(--perfect-fourth-3) 2fr 0.5fr;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		padding: var(--perfect-fourth-6);
	}
	.custom-modal-header {
		grid-area: header;
	}
	.custom-modal-header h6 {
		flex: 9;
	}
	.custom-modal-body {
		grid-area: body;
	}
	.custom-modal-footer {
		grid-area: footer;
	}
	:global(body.no-scroll) {
		height: 100vh;
		overflow: hidden;
	}
</style>
