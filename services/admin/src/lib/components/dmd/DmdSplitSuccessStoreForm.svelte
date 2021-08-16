<script lang="ts">
  import type {
    FailedDMDTask,
    SucceededDMDTask,
    WaitingDMDTask,
  } from "@crkn-rcdr/access-data";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import TempPrefixSelector from "$lib/components/dmd/TempPrefixSelector.svelte";

  let prefix = "oocihm";
  let shouldUpdateInAccess = true;
  let shouldUpdateInPreservation = true;

  let activeStepIndex = 0;
  let hasLookupRan = false;
  let showLookup = true;
  let showLoader = false;

  export let dmdTask:
    | WaitingDMDTask
    | FailedDMDTask
    | SucceededDMDTask
    | undefined = {
    id: "123",
    updated: "1628785112",
    attachments: {
      // ...metadata file info
    },
    user: {
      email: "email",
      name: "name",
    }, //for now
    mdType: "marcooe",
    process: {
      requestDate: "1628785101",
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
</script>

<!--OPTION B-->
<div class="wrapper">
  <br />
  <!--NotificationBar message="Metadata uploaded successfully!" /-->
  <br />

  <div class="auto-align">
    <div class="metadata-table ">
      <DmdItemsTable bind:dmdTask />
    </div>
    <div class="metadata-form">
      <ScrollStepper
        bind:activeStepIndex
        displayPrevious={true}
        enableAutoScrolling={false}
      >
        <ScrollStepperStep
          title={`Look-up items in an access platform${
            hasLookupRan ? " again" : ""
          }`}
        >
          <div slot="icon">1</div>

          <br />
          <!--div class="depositor-grid grid grid__col_2"-->
          <TempPrefixSelector bind:prefix />
          <br />

          <br />

          {#if prefix?.length}
            <!--button
            class="primary"
            on:click={() => {
              showLoader = true;
              setTimeout(() => {
                activeStepIndex = 1;
                for (const item of dmdTask["items"]) {
                  item["access"] = true;
                  item["preservation"] = true;
                }
                dmdTask = dmdTask;
                hasLookupRan = true;
                showLoader = false;
              }, 2000);
            }}
          >
            Look-up
          </button-->
            <button
              class="primary"
              class:secondary={hasLookupRan}
              on:click={() => {
                for (const item of dmdTask["items"]) {
                  delete item["access"];
                  delete item["preservation"];
                }
                dmdTask = dmdTask;
                showLoader = true;
                setTimeout(() => {
                  activeStepIndex = 1;
                  for (const item of dmdTask["items"]) {
                    item["access"] = true;
                    item["preservation"] = true;
                  }
                  dmdTask = dmdTask;
                  hasLookupRan = true;
                  showLoader = false;
                  showLookup = false;
                }, 12000);
              }}
            >
              <span
                class="auto-align auto-align__a-center"
                class:loading-button={showLoader}
              >
                {#if showLoader}
                  <Loading size="sm" />
                {/if}
                <span class="text"
                  >{!showLoader
                    ? hasLookupRan
                      ? "Look-up Again"
                      : "Look-up"
                    : "Looking-up..."}</span
                >
              </span>
            </button>
          {/if}
          <!--/div-->
          <!--{#if showLoader}
        <br />
        <br />
        <div class="loading-wrap">
          <Loading backgroundType="secondary" />
        </div-->
        </ScrollStepperStep>
        <ScrollStepperStep
          title="Update the descriptive metadata records of the items"
          isLastStep={true}
        >
          <div slot="icon">2</div>
          {#if !showLoader}
            <br />
            <div class="update-wrap">
              <!--div class="update-grid grid grid__col_3"-->
              <div>
                <label for="access">Update in access</label>
                <input
                  name="access"
                  type="checkbox"
                  bind:checked={shouldUpdateInAccess}
                />
              </div>
              <br />
              <div>
                <label for="preservation">Update in preservation</label>
                <input
                  name="preservation"
                  type="checkbox"
                  bind:checked={shouldUpdateInPreservation}
                />
              </div>
              <br />
              {#if shouldUpdateInAccess || shouldUpdateInPreservation}
                <button class="primary"
                  >Update Descriptive Metadata Records</button
                >
              {/if}
              <!--/div-->
            </div>
          {/if}
        </ScrollStepperStep>
      </ScrollStepper>
    </div>
  </div>
</div>

<!--
  Todo: hide access selector if has run = until user click edit icon on found in access
  pass actual access name to table
  cleanup
  document
  "
-->

<!--div class="hero hero__gradient">
  <div class="wrapper">
    <h3>Metadata uploaded sucessfully!</h3>
    <div class="auto-align auto-align__a-center">
      <div class="tab active">Lookup</div>
      <div class="tab">Update</div>
    </div>
  </div>
</div>

<div class="wrapper">
  {#if showLookup}
    <div class="depositor-grid grid grid__col_2">
      <TempPrefixSelector bind:prefix />
      {#if prefix?.length}
        <button
          class="primary"
          on:click={() => {
            for (const item of dmdTask["items"]) {
              delete item["access"];
              delete item["preservation"];
            }
            dmdTask = dmdTask;
            showLoader = true;
            setTimeout(() => {
              for (const item of dmdTask["items"]) {
                item["access"] = true;
                item["preservation"] = true;
              }
              dmdTask = dmdTask;
              hasLookupRan = true;
              showLoader = false;
              showLookup = false;
            }, 12000);
          }}
        >
          <span
            class="auto-align auto-align__a-center"
            class:loading-button={showLoader}
          >
            {#if showLoader}
              <Loading size="sm" />
            {/if}
            <span class="text"
              >{!showLoader
                ? hasLookupRan
                  ? "Look-up Again"
                  : "Look-up"
                : "Looking-up..."}</span
            >
          </span>
        </button>
      {/if}
    </div>
  {/if}

  {#if hasLookupRan}
    <div>
      <div class="update-grid grid grid__col_3">
        <span>
          <label for="access">Update in access</label>
          <input
            name="access"
            type="checkbox"
            bind:checked={shouldUpdateInAccess}
          />
        </span>
        <span>
          <label for="preservation">Update in preservation</label>
          <input
            name="preservation"
            type="checkbox"
            bind:checked={shouldUpdateInPreservation}
          />
        </span>
        {#if shouldUpdateInAccess || shouldUpdateInPreservation}
          <button class="primary">Update Descriptive Metadata Records</button>
        {/if}
      </div>
    </div>
  {/if}
  <DmdItemsTable bind:dmdTask />
</div-->
<style>
  .hero {
    padding: 0 !important;
  }
  .hero h3 {
    padding: var(--perfect-fourth-2) 0 var(--perfect-fourth-4) 0 !important;
  }
  .metadata-form {
    flex: 1;
    padding-left: 4rem;
  }
  .metadata-table {
    flex: 1.5;
  }
  /*.tab {
    min-width: 20rem;
    padding: var(--perfect-fourth-7) 0;
    text-align: center;
  }
  .tab.active {
    border-bottom: 0.4rem solid #35c7d8;
    background: #ffffff29;
  }*/
  .loading-wrap {
    margin: auto;
  }
  .depositor-grid,
  .update-grid,
  .loading-wrap {
    margin-top: var(--perfect-fourth-8);
    margin-bottom: var(--perfect-fourth-8);
  }
  .loading-button .text {
    margin-left: var(--margin-sm);
  }
</style>
