import test from "ava";
import { tester } from "../common.spec";

import { toCouch } from "../couch/util";
import { Dipstaging, validate } from "../dipstaging";

const { isValid } = tester(validate);

/*
{
  
  id: string;

  slug?: Slug;

  repos: string[];

  reposManifestDate: Timestamp;

  reposDate: Timestamp;

  METS: Mets[];

  METSManifestDate: Timestamp;

  METSDate: Timestamp;

  updated: Timestamp;

  smelt?: ProcessUpdate;

  staff?: StaffUpdate;
}
*/
const testDipstagingDoc : Dipstaging = {
    id: "69429/m02n4zg6h671",
    _rev: "14-12f0cda072e2f32e6efb4315220b7a88",
    slug: "oocihm.8_06941_2",
    repos: ["one"],
    reposManifestDate: "2021-01-14T02:28:24Z",
    reposDate: "2021-01-14T02:28:24Z",
    METS: [{
        path: "/fictitious/path",
        md5:"48f2c808224824705562a8891f90978e"/*
        5421154ae078d9b9feb36a144a532652
        0aaaa34cec8827ecf9dc9cc0c8f9646e
        f9a4fc46474d222814b901e0d1bf06b9
        d405f681e7ea2c2d08a7b70c3b5b23b1" *///todo: get format
    }],
    METSManifestDate: "2021-01-14T02:28:24Z",
    METSDate: "2021-01-14T02:28:24Z",
    updated: "2021-01-14T02:28:24Z",
    smelt: {
        succeeded: true,
        message: "",
        requestDate: "2021-01-14T02:28:24Z",
        processDate: "2021-01-14T16:30:02Z",
    },
    staff : {
        by : { 
            name : "Brittny Lapierre", email: "blapierre@crkn.ca"
        },
        date: "2021-01-14T16:30:02Z"
    }
};

test(
    "Dipstaging couch schema validates a dipstaging document",
    isValid,
    testDipstagingDoc
);