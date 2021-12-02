import { z } from "zod";
import { Identified, ProcessUpdate, Slug } from "../util/index.js";
import { TextRecord } from "./util/TextRecord.js";

export const DMDType = z.enum(["dc", "marc", "issueinfo"]);

export const AccessObjectTrait = z
  .object({
    /**
     * Information about the most recent update to the internalmeta database
     * made because of changes to this object.
     */
    updateInternalmeta: ProcessUpdate.optional(),

    /**
     * Human-readable identifier used to retrieve this object.
     */
    slug: Slug,

    /**
     * Human-readable name or title.
     */
    label: TextRecord,

    /**
     * A short textual summary.
     */
    summary: TextRecord.optional(),

    /**
     * The type of descriptive metadata record associated with this resource.
     */
    dmdType: DMDType.optional(),
  })
  .merge(Identified);
