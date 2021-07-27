/**
 * @module
 * Overview:
 * The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.
 *
 * Usage:
 * <Editor bind:object />
 *
 * Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
 */

import type { TRPCClient } from "@trpc/client";
import type { LapinRouter } from "@crkn-rcdr/lapin-router";
import type { User } from "@crkn-rcdr/access-data";

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
 * Defins what information to include for the dynamic generation of pages in the side menu component
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
