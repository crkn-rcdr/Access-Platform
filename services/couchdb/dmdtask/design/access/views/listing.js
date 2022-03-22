module.exports = {
  map: function (doc) {
    const isParseQueued = () => {
      return (
        doc.process &&
        doc.process.requestDate &&
        !("processDate" in doc.process) &&
        !doc.items
      );
    };

    const isParsing = () => {
      return (
        doc.process &&
        doc.process.requestDate &&
        !("processDate" in doc.process) &&
        !doc.items &&
        doc.stage === "parsing"
      );
    };

    const isParseFailed = () => {
      return (
        doc.process &&
        "processDate" in doc.process &&
        !doc.process.succeeded &&
        !doc.items
      );
    };

    const parseItemCheck = () => {
      let firstItem = null;
      if (doc.items && doc.items.length) firstItem = doc.items[0];
      return firstItem && !("stored" in firstItem);
    }; //&& !("shouldStore" in firstItem)

    const isParseSucceeded = () => {
      return (
        doc.process &&
        "processDate" in doc.process &&
        doc.process.succeeded &&
        doc.items &&
        "itemsCount" in doc &&
        parseItemCheck()
      );
    };

    const storeItemCheck = () => {
      if (!doc.items) return false;

      let lastItem;
      for (let i = doc.items.length - 1; i >= 0; i--) {
        if (doc.items[i].shouldStore) {
          lastItem = doc.items[i];
          break;
        }
      }
      return lastItem && "shouldStore" in lastItem && !("stored" in lastItem);
    };

    const isStoreQueued = () => {
      return (
        doc.process &&
        doc.process.requestDate &&
        !("processDate" in doc.process) &&
        doc.items &&
        "itemsCount" in doc &&
        storeItemCheck()
      );
    };

    const isStoring = () => {
      return (
        doc.process &&
        doc.process.requestDate &&
        !("processDate" in doc.process) &&
        doc.items &&
        "itemsCount" in doc &&
        doc.stage === "store-started" &&
        storeItemCheck()
      );
    };

    const storeCompleteItemCheck = () => {
      if (!doc.items) return false;

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
        "shouldStore" in firstItem &&
        "stored" in firstItem &&
        lastItem &&
        "stored" in lastItem
      );
    };

    const isStoreFailed = () => {
      return (
        doc.process &&
        "processDate" in doc.process &&
        !doc.process.succeeded &&
        doc.items &&
        "itemsCount" in doc &&
        storeCompleteItemCheck()
      );
    };

    const isStoreSucceeded = () => {
      return (
        doc.process &&
        doc.process.processDate &&
        doc.process.succeeded &&
        doc.items &&
        "itemsCount" in doc &&
        storeCompleteItemCheck()
      );
    };

    const storePausedItemCheck = () => {
      if (!doc.items) return false;

      let lastItem;
      for (let i = doc.items.length - 1; i >= 0; i--) {
        if (doc.items[i].shouldStore) {
          lastItem = doc.items[i];
          break;
        }
      }

      return lastItem && "shouldStore" in lastItem && !("stored" in lastItem);
    };

    const isStorePaused = () => {
      return (
        doc.process &&
        doc.process.processDate &&
        doc.process.succeeded &&
        doc.items &&
        "itemsCount" in doc &&
        doc.stage === "store-paused" &&
        storePausedItemCheck()
      );
    };

    let type = "N/A";
    if (isStorePaused()) type = "store paused";
    else if (isStoreSucceeded()) type = "store succeeded";
    else if (isStoreFailed()) type = "store failed";
    else if (isStoring()) type = "storing";
    else if (isStoreQueued()) type = "store queued";
    else if (isParseSucceeded()) type = "parse succeeded";
    else if (isParseFailed()) type = "parse failed";
    else if (isParsing()) type = "parsing";
    else if (isParseQueued()) type = "parse queued";

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

    emit(doc._id, {
      fileName: doc.fileName ? doc.fileName : "",
      type,
      date,
      count: doc.itemsCount ? doc.itemsCount : 0,
      message,
    });
  },
  reduce: "_count",
};
