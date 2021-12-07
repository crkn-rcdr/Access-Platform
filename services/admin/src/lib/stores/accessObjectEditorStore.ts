import type { PagedAccessObject } from "@crkn-rcdr/access-data";
import { writable } from "svelte/store";

export const editorObjectStore = writable<PagedAccessObject>();
