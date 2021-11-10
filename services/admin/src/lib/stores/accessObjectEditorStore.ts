import type { AccessObject } from "@crkn-rcdr/access-data";
import { writable } from "svelte/store";

export const editorObjectStore = writable<AccessObject>();
