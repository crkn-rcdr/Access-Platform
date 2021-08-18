<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import DmdDepositorSelector from "$lib/components/dmd/DmdDepositorSelector.svelte";
  import DmdTaskInfoTable from "./DmdTaskInfoTable.svelte";
  import ExpansionTile from "../shared/ExpansionTile.svelte";
  let depositor = {
    string: "oocihm",
    label: "Canadiana.org",
  };
  let shouldUpdateInAccess = true;
  let shouldUpdateInPreservation = true;
  let activeStepIndex = 0;
  let hasLookupRan = false;
  let showLookupResults = false;
  let showLookupLoader = false;
  export let dmdTask: SucceededDMDTask = {
    id: "123",
    updated: "1628785112",
    attachments: {
      // ...metadata file info
    },
    user: {
      email: "email",
      name: "name",
    }, //for now
    format: "marcooe",
    process: {
      requestDate: "1628785101",
      processDate: "1628785101",
      succeeded: true,
      message: "The process.message from the backend",
    },
    items: [
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
      {
        message: `{
    "_id": "6116ba28948421e08ac27da1",
    "index": 0,
    "guid": "3ed1c087-e10b-4fae-b160-295a6c4ebab2",
    "isActive": false,
    "balance": "$3,247.23",
    "picture": "http://placehold.it/32x32",
    "age": 39,
    "eyeColor": "blue",
    "name": "Tasha Vazquez",
    "gender": "female",
    "company": "LIQUICOM",
    "email": "tashavazquez@liquicom.com",
    "phone": "+1 (926) 519-2616",
    "address": "149 Hampton Avenue, Convent, Wyoming, 9623",
    "about": "Cupidatat culpa officia proident sint irure pariatur eiusmod magna do ullamco commodo. Ut nostrud sunt aliqua anim et deserunt ut sit eiusmod aute. Lorem proident sint anim anim officia dolore ut officia mollit ullamco ex veniam. Veniam qui aliquip nulla deserunt do. Nostrud dolore sit dolore velit.",
    "registered": "2021-04-13T05:35:59 +04:00",
    "latitude": -62.302263,
    "longitude": 93.035148,
    "tags": [
      "proident",
      "laboris",
      "aliqua",
      "id",
      "nisi",
      "nostrud",
      "qui"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Herminia Cobb"
      },
      {
        "id": 1,
        "name": "Maldonado Pitts"
      },
      {
        "id": 2,
        "name": "Hardy Branch"
      },
      [
      {
        "id": 1234,
        "name": "moo"
      }]
    ],
    "greeting": "Hello, Tasha Vazquez! You have 7 unread messages.",
    "favoriteFruit": "banana"
  }`,
        id: "8_06941_1",
        label: "Vol. I, No. 1 (October 17, 1891)",
        parsed: true,
      },
    ],
  };

  $: {
    depositor;
    showLookupResults = false;
    activeStepIndex = 0;
  }
</script>

<div class="metadata-form">
  <ScrollStepper
    bind:activeStepIndex
    displayPrevious={true}
    enableAutoScrolling={false}
  >
    <ScrollStepperStep
      title={`Select an access platform and look-up items${
        hasLookupRan ? " again" : ""
      }`}
    >
      <div slot="icon">1</div>

      <DmdDepositorSelector bind:depositor />

      {#if depositor?.string?.length}
        <button
          class="primary"
          class:secondary={activeStepIndex === 1}
          on:click={() => {
            activeStepIndex = 0;
            for (const item of dmdTask["items"]) {
              delete item["access"];
              delete item["preservation"];
            }
            dmdTask = dmdTask;
            showLookupLoader = true;
            showLookupResults = false;
            setTimeout(() => {
              activeStepIndex = 1;
              for (const item of dmdTask["items"]) {
                item["access"] = Math.random() > 0.5;
                item["preservation"] = Math.random() > 0.5;
              }
              dmdTask = dmdTask;
              hasLookupRan = true;
              showLookupLoader = false;
              showLookupResults = true;
            }, 12000);
          }}
        >
          <span
            class="auto-align auto-align__a-center"
            class:loading-button={showLookupLoader}
          >
            {#if showLookupLoader}
              <Loading size="sm" />
            {/if}
            <span class="text"
              >{!showLookupLoader
                ? hasLookupRan
                  ? "Look-up Again"
                  : "Look-up"
                : "Looking-up..."}</span
            >
          </span>
        </button>
      {/if}
    </ScrollStepperStep>
    <ScrollStepperStep title={`Start updating`} isLastStep={true}>
      <div slot="icon">2</div>
      {#if !showLookupLoader}
        <div
          class="update-wrap auto-align auto-align__a-center auto-align__j-between "
        >
          <span>
            <input
              name="access"
              type="checkbox"
              bind:checked={shouldUpdateInAccess}
            />
            <label for="access">in {depositor["label"]}</label>
          </span>
          <span>
            <input
              name="preservation"
              type="checkbox"
              bind:checked={shouldUpdateInPreservation}
            />
            <label for="preservation">in Preservation</label>
          </span>
          {#if shouldUpdateInAccess || shouldUpdateInPreservation}
            <button class="primary">Update Descriptive Metadata Records</button>
          {/if}
        </div>
      {/if}
    </ScrollStepperStep>
  </ScrollStepper>
</div>

<div class="metadata-table">
  <DmdItemsTable
    bind:dmdTask
    bind:accessLabel={depositor["label"]}
    showAccessColumn={shouldUpdateInAccess && showLookupResults}
    showPreservationColumn={shouldUpdateInPreservation && showLookupResults}
  />
</div>

<style>
  .loading-button .text {
    margin-left: var(--margin-sm);
  }
  .update-wrap {
    width: 100%;
  }

  /*@keyframes fadeout {
    from {
      opacity: 1;
      height: initial;
    }
    to {
      opacity: 0;
      height: 0;
    }
  }*/
</style>
