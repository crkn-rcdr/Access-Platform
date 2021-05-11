import {
  AccessorEndpoints,
  AccessorOptions,
  initializeEndpoints,
} from "./endpoints";
import { SlugInterface, slugInterface } from "./slug";

/**
 * An object for performing operations in the Canadiana Access Platform.
 */
export class Accessor {
  private readonly endpoints: AccessorEndpoints;

  /**
   * Provides an interface to slug operations.
   */
  readonly slug: SlugInterface;

  constructor(options: AccessorOptions) {
    this.endpoints = initializeEndpoints(options);
    this.slug = slugInterface(this.endpoints.couch.access);
  }
}
