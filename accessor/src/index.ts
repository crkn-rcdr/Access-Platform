import { Auth } from "@crkn-rcdr/nano";
import { DatabaseHandlers, getHandlers } from "./databases";

export class Accessor {
  private readonly databases: DatabaseHandlers;

  constructor(url: string, auth?: Auth) {
    this.databases = getHandlers(url, auth);
    this.databases.access;
  }
}
