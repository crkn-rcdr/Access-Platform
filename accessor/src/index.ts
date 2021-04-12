import { Auth } from "@crkn-rcdr/nano";
import { DatabaseHandlers, getHandlers } from "./databases";
import { Slug, slugInterface } from "./slug";

export class Accessor {
  private readonly databases: DatabaseHandlers;
  readonly slug: Slug;

  constructor(url: string, auth?: Auth) {
    this.databases = getHandlers(url, auth);
    this.slug = slugInterface(this.databases.access);
  }
}
