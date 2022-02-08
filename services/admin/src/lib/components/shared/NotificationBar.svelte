<!--
@component
### Overview
A component tha tis used to highlight important messages to the user

### Properties
|    |    |    |
| -- | -- | -- |
| message : string                                | required | The message to be displayed on the notification bar, must be a non-empty string |
| status: string, "success" or "fail" or "warn" or "secondary"   | optional | The state of the notification, determines the colour displayed and options available. |
| detail : string                                 | optional | Any detailed information that will be shown in the expandable portion |
| expandable : boolean                            | optional| If there will be an expandible portion or not |
| float : boolean                                 | optional | If the notification bar should be drawn independant of the rest of the dom, floating on the bottom right, or if it should be drawn in-place |
| dissmissFunction : Function                     | optional | A function that will run when the user presses the 'dismiss' button |
| notificationPosition : number                   | optional | The position of the notifciation in the list of notifications on the bottom right corner |

### Usage
**Example one**
```  
<NotificationBar message="A non empty string" status="success" />
```
*Note: `message` must be non-empty to have the notification display.*
-->
<script lang="ts">
  import ExpansionTile from "$lib/components/shared/ExpansionTile.svelte";

  /**
   * @type {string} The message to be displayed on the notification bar, must be a non-empty string.
   */
  export let message = "";

  /**
   * @type {"success" | "fail" | "warn" | "secondary" | "primary" } The state of the notification, determines the colour displayed and options available.
   */
  export let status: "success" | "fail" | "warn" | "secondary" | "primary" =
    "success";

  /**
   * @type {string} Any detailed information that will be shown in the expandable portion.
   */
  export let detail = "";

  /**
   * @type {boolean} If there will be an expandible portion or not.
   */
  export let expandable = false;

  /**
   * @type {boolean} If the notification bar should be drawn independant of the rest of the dom, floating on the bottom right, or if it should be drawn in-place.
   */
  export let float = false;

  /**
   * @type {Function} A function that will run when the user presses the 'dismiss' button.
   */
  export let dissmissFunction = null;

  /**
   * @type {number} The position of the notifciation in the list of notifications on the bottom right corner.
   */
  export let notificationPosition = 1;

  /**
   * @type {number} The height of the notification bar.
   */
  const notificationHeightRem = 5;

  /**
   * @type {number} The spacing between notifciations in the list of notifications on the bottom right corner.
   */
  const notificationSpacing = 1;
</script>

{#if message && message.length}
  <div
    class={`notification-bar notification-bar-${status}`}
    class:notification-bar-float={float}
    style={float
      ? `bottom: ${
          notificationPosition * notificationHeightRem + notificationSpacing
        }rem;`
      : ""}
  >
    {#if expandable && detail && detail.length}
      <ExpansionTile useInfoIcon={true}>
        <div slot="top">
          {@html message}
          {#if dissmissFunction}
            <button class="dismiss sm ghost dark" on:click={dissmissFunction}
              >dismiss</button
            >
          {/if}
        </div>
        <div slot="bottom">{detail}</div>
      </ExpansionTile>
    {:else}
      {@html message}
    {/if}
  </div>
{/if}

<style>
  .notification-bar {
    background-color: var(--structural-div-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    display: block;
    width: 100%;
  }
  .notification-bar-float {
    position: fixed;
    right: 1rem;
    min-width: 20rem;
    max-width: 36rem;
    display: inline-block;
    z-index: 2;
  }

  .notification-bar-secondary {
    background-color: var(--secondary-light);
    border: 1px solid var(--secondary);
    color: var(--secondary);
  }

  .notification-bar-primary {
    background-color: var(--primary-light);
    border: 1px solid var(--primary);
    color: var(--primary);
  }

  .notification-bar-success {
    background-color: var(--success-light);
    border: 1px solid var(--success);
    color: var(--success);
  }
  .notification-bar-warn {
    background-color: var(--warn-light);
    border: 1px solid var(--warn);
    color: var(--warn);
  }
  .notification-bar-fail {
    background-color: var(--danger-light);
    border: 1px solid var(--danger);
    color: var(--danger);
  }
  div {
    display: inline;
  }

  .dismiss {
    float: right;
  }
</style>
