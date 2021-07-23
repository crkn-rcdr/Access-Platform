async function showConfirmation(call, success, fail) {
  const res = await call();
  return res;
}
export { showConfirmation };
/*

        new MyComponent({
  target: mountpoint // here the dom node where you want to mount it
})
*/
