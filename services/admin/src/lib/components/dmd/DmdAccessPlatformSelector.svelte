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
<DmdDepositorSelector bind:depositor={depositor} />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { AccessPlatform } from "$lib/types";
  /**
   * @type {AccessPlatform} The access platform information that is selected in the selection element
   */
  export let depositor: AccessPlatform;

  /**
   * @type { object} The object of prefix options for the selection element.
   */
  const depositors = {
    ams: "Shortgrass Public Library System",
    omcn: "Mississauga Library System",
    oocihm: "Canadiana.org",
    ooe: "Department of Foreign Affairs Trade and Development",
    oop: "Library of Parliament",
    carl: "Canadian Association of Research Libraries",
    numeris: "Numeris - broadcast measurement and consumer behaviour data",
    osmsdga: "South Mountain",
    ooga: "Canadian Hazards Information Service",
    qmma: "McGill University Archives",
    "490": "MARC File",
  };
</script>

<select
  name="depositor"
  on:change={(e) => {
    depositor = {
      prefix: e.target["value"],
      label: depositors[e.target["value"]],
    };
  }}
  value={depositor["prefix"]}
>
  <option value="">Select an access platform:</option>
  {#each Object.keys(depositors) as depositorCode}
    <option value={depositorCode}>
      {depositors[depositorCode]} ({depositorCode})
    </option>
  {/each}
</select>

<style>
  select {
    width: 100%;
  }
</style>
