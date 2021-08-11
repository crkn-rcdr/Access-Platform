<!--
@component
### Overview
This component shows the user the progress of and result for each store request (adding the metadata files to the access and/or preservation databases) for the items generated in the split task.

### Properties
none

### Usage
```  
<DmdStoreTask />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<div class="store-task-result">1/50 items...</div>

<style>
  .store-task-result {
    min-height: 50rem;
  }
</style>
