this.addEventListener("message", function (evt) {
  let data = evt.data;
  let time = parseInt(data.timeout || 0, 10);
  setTimeout(() => {
    this.postMessage({ time: Date.now() });
  }, time);
});
