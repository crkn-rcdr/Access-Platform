<!--
@component
### Overview
Allows the user to select one of many pre-defined depositors.
### Properties
|    |    |    |
| -- | -- | -- |
| prefix: string    | optional | The prefix that is selected in the selection element |
### Usage
```  
<DmdPrefixSelector bind:prefix={depositorPrefix} />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { Depositor } from "$lib/types";
  /**
   * @type {string} The prefix that is selected in the selection element |
   */
  export let prefix: string;
  // TODO: add period to end of each prefix?
  /**
   * @type { Array<Depositor>} The array of prefix opetions for the selection element.
   */
  const prefixes: Array<Depositor> = [
    {
      string: "ams",
      label: "Shortgrass Public Library System",
    },
    {
      string: "omcn",
      label: "Mississauga Library System",
    },
    {
      string: "oocihm",
      label: "Canadiana.org",
    },
    {
      string: "ooe",
      label: "Department of Foreign Affairs Trade and Development",
    },
    {
      string: "oop",
      label: "Library of Parliament",
    },
    {
      string: "carl",
      label: "Canadian Association of Research Libraries",
    },
    {
      string: "numeris",
      label: "Numeris - broadcast measurement and consumer behaviour data",
    },
    {
      string: "osmsdga",
      label: "South Mountain",
    },
    {
      string: "ooga",
      label: "Canadian Hazards Information Service",
    },
    {
      string: "qmma",
      label: "McGill University Archives",
    },
    {
      string: "490",
      label: "MARC File",
    },
  ];
</script>

<select name="depositor" bind:value={prefix}>
  <option value="">Select an access platform:</option>
  {#each prefixes as prefix}
    <option value={prefix.string}>{prefix.label} ({prefix.string})</option>
  {/each}
</select>

<style>
  select {
    width: 100%;
  }
</style>