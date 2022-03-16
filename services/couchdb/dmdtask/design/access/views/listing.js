module.exports = {
  map: function (doc) {
    const isParsing = () => {
      return (
        doc.process &&
        doc.process.requestDate &&
        !doc.process.processDate &&
        !doc.items
      );
    };

    const isParseFailed = () => {
      return (
        doc.process &&
        doc.process.processDate &&
        !doc.process.succeeded &&
        !doc.items
      );
    };

    const parseItemCheck = () => {
      let firstItem = null;
      if (doc.items && doc.items.length) firstItem = doc.items[0];
      return (
        firstItem && !("destination" in firstItem) && !("stored" in firstItem)
      );
    };

    const isParseSucceeded = () => {
      return (
        doc.process &&
        doc.process.processDate &&
        doc.process.succeeded &&
        doc.items &&
        parseItemCheck()
      );
    };

    const loadItemCheck = () => {
      let firstItem;
      for (const item of doc.items) {
        if (item.shouldStore) {
          firstItem = item;
          break;
        }
      }
      return (
        firstItem && "destination" in firstItem && !("stored" in firstItem)
      );
    };
    const isLoading = () => {
      return (
        doc.process &&
        doc.process.requestDate &&
        !doc.process.processDate &&
        doc.items &&
        loadItemCheck()
      );
    };

    const loadCompleteItemCheck = () => {
      let firstItem;
      for (const item of doc.items) {
        if (item.shouldStore) {
          firstItem = item;
          break;
        }
      }

      let lastItem;
      for (let i = doc.items.length - 1; i >= 0; i--) {
        if (doc.items[i].shouldStore) {
          lastItem = doc.items[i];
          break;
        }
      }

      return (
        firstItem &&
        "destination" in firstItem &&
        "stored" in firstItem &&
        lastItem &&
        "stored" in lastItem
      );
    };

    const isLoadFailed = () => {
      return (
        doc.process &&
        doc.process.processDate &&
        !doc.process.succeeded &&
        doc.items &&
        loadCompleteItemCheck()
      );
    };

    const isLoadSucceeded = () => {
      return (
        doc.process &&
        doc.process.processDate &&
        doc.process.succeeded &&
        doc.items &&
        loadCompleteItemCheck()
      );
    };

    const loadPausedItemCheck = () => {
      /*let firstItem;
      for (const item of doc.items) {
        if (item.shouldStore) {
          firstItem = item;
          break;
        }
      }*/

      let lastItem;
      for (let i = doc.items.length - 1; i >= 0; i--) {
        if (doc.items[i].shouldStore) {
          lastItem = doc.items[i];
          break;
        }
      }

      return lastItem && "destination" in lastItem && !("stored" in lastItem);
    };

    const isLoadPaused = () => {
      return (
        doc.process &&
        doc.process.processDate &&
        doc.process.succeeded &&
        doc.items &&
        loadPausedItemCheck()
      );
    };

    let type = "N/A";
    if (isLoadPaused()) type = "paused";
    else if (isLoadSucceeded()) type = "load succeeded";
    else if (isLoadFailed()) type = "load failed";
    else if (isLoading()) type = "loading";
    else if (isParseSucceeded()) type = "parse succeeded";
    else if (isParseFailed()) type = "parse failed";
    else if (isParsing()) type = "parsing";

    let date = 0;
    let message = "";
    if (doc.process) {
      if (doc.process.processDate) {
        date = doc.process.processDate;
        if (doc.process.message) message = doc.process.message;
      } else if (doc.process.requestDate) {
        date = doc.process.requestDate;
      }
    }

    emit(doc.id, {
      fileName: doc.fileName ? doc.fileName : "",
      type,
      date,
      count: doc.items ? doc.items.length : 0,
      message,
    });
  },
  reduce: "_count",
};
