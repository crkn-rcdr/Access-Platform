<!--
@component
### Overview
Allows the user to select one of many pre-defined depositors.
### Properties
|    |    |    |
| -- | -- | -- |
| depositor: {string: string; label: string}    | optional | The prefix that is selected in the selection element |
### Usage
```  
<PrefixSelector bind:depositor={depositor} />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
	import type { Depositor } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	/**
	 * @type {Depositor} The access platform information that is selected in the selection element
	 */
	export let depositor: Depositor;

	/**
	 * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
	 */
	const dispatch = createEventDispatcher();

	/**
	 * @type { object} The object of prefix options for the selection element.
	 */
	const depositors = {
		none: 'No Prefix',
		ams: 'Shortgrass Public Library System',
		carl: 'Canadian Association of Research Libraries',
		numeris: 'Numeris - broadcast measurement and consumer behaviour data',
		omcn: 'Mississauga Library System',
		oocihm: 'Canadiana.org',
		ooe: 'Department of Foreign Affairs Trade and Development',
		ooga: 'Canadian Hazards Information Service',
		oop: 'Library of Parliament',
		osmsdga: 'South Mountain',
		qmma: 'McGill University Archives',
		sru: 'University of Regina Archives'
	};
</script>

<span>
	<label for="depositor">Select prefix:</label>
	<select
		name="depositor"
		on:change={(e) => {
			depositor = {
				prefix: e.target['value'],
				label: depositors[e.target['value']]
			};
			dispatch('depositorSelected', depositor);
		}}
		value={depositor?.['prefix']}
	>
		<option disabled selected value>Select a prefix:</option>
		{#each Object.keys(depositors) as depositorCode}
			<option value={depositorCode}>
				{depositorCode} ({depositors[depositorCode]})
			</option>
		{/each}
	</select>
</span>

<style>
	select {
		width: 100%;
	}
</style>
