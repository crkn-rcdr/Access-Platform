import { ServerScope } from "nano";

import {
  Canvas
} from "@crkn-rcdr/access-data";

import { DatabaseHandler } from "../DatabaseHandler.js";

/**
 * Interact with Access Objects in their database.
 */
export class CanvasHandler extends DatabaseHandler<Canvas> {
  /**
   * Create an CanvasHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the access database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(suffix ? `canvas-${suffix}` : `canvas`, Canvas, client);
  }

  /**
   * Creates a new Canvas.
   * @returns The created Canvas.
   */
  async createCanvas(data: Canvas): Promise<Canvas> {
    const canvasObj = Canvas.parse(data)
    await this.insert({
      ...canvasObj,
    })
    const canvas = await this.get(data.id)
    return Canvas.parse(canvas);
  }
}
