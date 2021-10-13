/**
 * @module types
 * @description
 * This module contains types that are used throughout the admin app.
 */

import type { TRPCClient } from "@trpc/client";
import type { LapinRouter } from "@crkn-rcdr/lapin-router";
import type { Noid, Slug, User } from "@crkn-rcdr/access-data";

/**
 * Session exported by the `getSession` hook.
 */
export type ServerSession = {
  apiEndpoint: string;
  authLogout: string;
  user: User;
};

export type Locals = {
  session: ServerSession;
};

/**
 * Session after the root __layout component updates it with the lapin client.
 */
export type Session = ServerSession & {
  lapin: TRPCClient<LapinRouter>;
};

/**
 * Output of the root layout component's load function.
 */
export type RootLoadOutput = {
  context: {
    lapin: TRPCClient<LapinRouter>;
  };
  props: {
    lapin: TRPCClient<LapinRouter>;
  };
};

/**
 * Allows for the toggleable action to toggle HTML elements
 */
export type ToggleParams = {
  toggled: boolean;
  display: string;
};

/**
 * Defines what information to include for the dynamic generation of pages in the side menu component
 */
export type SideMenuPageData = {
  name: string;
  componentData: {
    contentComponent: any;
    contentComponentProps: any;
    sideMenuPageProps: any;
    update: Function;
  };
};

export type DmdItemState = {
  slug: Slug;
  noid: Noid;
  parseSuccess: boolean;
  foundInAccess: "Yes" | "No" | "Searching...";
  foundInPreservation: "Yes" | "No" | "Searching...";
  updatedInAccess: "Yes" | "No" | "Updating...";
  updatedInAccessMsg: string;
  updatedInPreservation: "Yes" | "No" | "Updating...";
  updatedInPreservationMsg: string;
  shouldUpdate: boolean;
};

export type DmdItemStates = Map<string, DmdItemState>;

export type DmdTaskState = {
  lookupState: "ready" | "loading" | "loaded" | "error";
  updateState: "ready" | "updarting" | "updated" | "error";
  itemStates: DmdItemStates;
  errorMsg: string;
  shouldUpdateInPreservation: boolean;
  shouldUpdateInAccess: boolean;
  updatedProgressPercentage: number;
};

export type DmdTasksCache = Map<string, DmdTaskState>;

/**
 * Used to create a pull-down of available access platforms to prepend to identifiers in the CSV or MarcXML files.
 */
export type Depositor = {
  prefix: string;
  label: string;
};
