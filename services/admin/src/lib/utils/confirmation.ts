/**
 * @module confirmation
 * @description
 * This module contains methods that enable script code to show notifications in the notifications list depending on the result of a method call.
 */

import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

/**
 * @type {number} The length of time the notification should be displayed on the screen.
 */
const DISPLAY_TIME = 5000;

/**
 * @type {number} A counter of the number of notifications visible on the screen.
 */
let numVisibleNotifications = 0;

//TODO: make the notifications shift down when previous is clear, add an expected result to test the failure case
/**
 * Shows a confirmation notification at the bottom right corner when the call (a lapin function) fails. The successMsg will display upon suggess, and the failMsg will show if it fails. The response of the call or the error is returned.
 * @param call
 * @param successMsg
 * @param failMsg
 * @returns any
 */
async function showConfirmation(
  call,
  successMsg,
  failMsg,
  hideOnSuccess = false
) {
  try {
    const res: { success: boolean; details: string } = await call();

    if (hideOnSuccess && res["success"]) return;
    numVisibleNotifications++;
    const notification = new NotificationBar({
      target: document.body,
      props: {
        message: res["success"] ? successMsg : failMsg,
        detail: res["details"],
        status: res["success"] ? "success" : "fail",
        expandable: true,
        float: true,
        notificationPosition: 0, //numVisibleNotifications,
        dismissFunction: () => {
          notification.$destroy();
          numVisibleNotifications--;
        },
      },
    });
    if (res["success"]) {
      setTimeout(() => {
        notification.$destroy();
        numVisibleNotifications--;
      }, DISPLAY_TIME);
    }
    return res["success"];
  } catch (e) {
    // In case something really blows up, or someone forgets to wrap implementation of call in try/catch
    const notification = new NotificationBar({
      target: document.body,
      props: {
        message: failMsg,
        detail: e.message,
        status: "fail",
        expandable: true,
        float: true,
        notificationPosition: 0, //numVisibleNotifications,
        dismissFunction: () => {
          notification.$destroy();
          numVisibleNotifications--;
        },
      },
    });
    return e;
  }
}
export { showConfirmation };
