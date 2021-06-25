import type { Accessor } from "@crkn-rcdr/accessor";

// TODO: import this from the new User type in #83
export type User = {
  name: string;
  email: string;
};

/**
 * Data exposed to client-side code from the server
 */
export type Session = {
  host: string;
  user?: User | null;
  auth?: {
    endpoint: string;
    error?: string;
  };
};

/**
 * Data that can be referenced in server-side code
 */
export type Locals = {
  session: Session;
  accessor: Accessor;
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
  componentData: { component: any; props: any; update: Function };
};
