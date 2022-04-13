import { connect } from "@crkn-rcdr/couch-utils";

export function initializeCouchDB() {
  return connect();
}
