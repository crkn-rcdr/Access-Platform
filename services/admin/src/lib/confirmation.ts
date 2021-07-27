import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

/**
 * @type {string} Slug being resolved.
 */
const DISPLAY_TIME = 10000;

/**
 * @type {string} Slug being resolved.
 */
let numVisibleNotifications = 0;

//TODO: make the notifications shift down when previous is clear
/**
 *
 * @param arr
 * @param currentIndex
 * @param destinationIndex
 * @returns
 */
async function showConfirmation(call, successMsg, failMsg) {
  numVisibleNotifications++;
  try {
    const res = await call();
    console.log("RES", res);
    const notification = new NotificationBar({
      target: document.body,
      props: {
        message: res ? successMsg : failMsg,
        detail: JSON.stringify(res),
        status: res ? "success" : "fail",
        expandable: true,
        float: true,
        notificationPosition: numVisibleNotifications,
        dissmissFunction: res
          ? null
          : () => {
              notification.$destroy();
              numVisibleNotifications--;
            },
      },
    });
    if (res) {
      setTimeout(() => {
        notification.$destroy();
        numVisibleNotifications--;
      }, DISPLAY_TIME);
    }
    return res;
  } catch (e) {
    const notification = new NotificationBar({
      target: document.body,
      props: {
        message: failMsg,
        detail: JSON.stringify(e),
        status: "fail",
        expandable: true,
        float: true,
        notificationPosition: numVisibleNotifications,
        dissmissFunction: () => {
          notification.$destroy();
          numVisibleNotifications--;
        },
      },
    });
    return e;
  }
}
export { showConfirmation };
