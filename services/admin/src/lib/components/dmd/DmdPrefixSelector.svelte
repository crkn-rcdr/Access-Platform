<script>
  export let prefix = "";
  // TODO: add period to end of each prefix?
  const prefixes = [
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
  ];
</script>

<select bind:value={prefix}>
  <option value="">No prefix</option>
  {#each prefixes as prefix}
    <option value={prefix.string}>{prefix.label} ({prefix.string})</option>
  {/each}
</select>
