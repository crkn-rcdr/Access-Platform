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
    slug: "oocihm.8_06941_2",
    repos: ["one"],
    reposManifestDate: "2021-01-14T02:28:24Z",
    reposDate: "2021-01-14T02:28:24Z",
    METS: [{
        path: "/fictitious/path",
        md5: "md5" //todo: get format
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
    toCouch(testDipstagingDoc)
);