import type { PagedCollection, PagedManifest } from "@crkn-rcdr/access-data";
import { writable } from "svelte/store";

export const editorObjectStore = writable<PagedCollection | PagedManifest>();
