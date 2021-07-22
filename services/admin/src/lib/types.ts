//import type { Accessor } from "@crkn-rcdr/accessor";
import type { User } from "@crkn-rcdr/access-data";

export type Session = {
  apiEndpoint: string;
  authLogout: string;
  user: User;
};

export type Locals = {
  session: Session;
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
  }
};
