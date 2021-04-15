import { Auth } from "@crkn-rcdr/nano";
import { DatabaseHandlers, getHandlers } from "./databases";
import { SlugInterface, slugInterface } from "./slug";

/**
 * An object for performing operations in the Canadiana Access Platform.
 */
export class Accessor {
  private readonly databases: DatabaseHandlers;

  /**
   * Provides an interface to slug operations.
   */
  readonly slug: SlugInterface;

  constructor(url: string, auth?: Auth) {
    this.databases = getHandlers(url, auth);
    this.slug = slugInterface(this.databases.access);
  }
}
