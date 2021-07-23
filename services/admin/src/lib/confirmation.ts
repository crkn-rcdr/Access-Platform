import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

const DISPLAY_TIME = 10000;

async function showConfirmation(call, successMsg, failMsg) {
  try {
    const res = await call();
    console.log("RES", res);
    const notification = new NotificationBar({
      target: document.body,
      props: {
        message: res ? successMsg : failMsg,
        detail: JSON.stringify(res),
        status: res ? "success" : "fail",
      },
    });
    setTimeout(() => {
      notification.$destroy();
    }, DISPLAY_TIME);
    return res;
  } catch (e) {
    const notification = new NotificationBar({
      target: document.body,
      props: {
        message: failMsg,
        detail: JSON.stringify(e),
        status: "fail",
      },
    });
    setTimeout(() => {
      notification.$destroy();
    }, DISPLAY_TIME);
    return e;
  }
}
export { showConfirmation };
