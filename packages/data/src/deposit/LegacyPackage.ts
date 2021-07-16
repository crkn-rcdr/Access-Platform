import { z } from "zod";
import { MD5 } from "../util/MD5.js";
import { ProcessUpdate } from "../util/ProcessUpdate.js";
import { Slug } from "../util/Slug.js";
import { StaffUpdate } from "../util/StaffUpdate.js";
import { Timestamp } from "../util/Timestamp.js";
import { UnixFilePath } from "../util/UnixFilePath.js";

export const LegacyPackage = z.object({
  /**
   * The package's AIP id.
   */
  id: Slug,

  /**
   * The Slug chosen by staff for the associated Manifest.
   */
  slug: Slug.optional(),

  /**
   * A list of repository servers this package can be found on.
   */
  repos: z.array(z.string()),

  /**
   * The date the package's manifest was last updated.
   */
  reposManifestDate: Timestamp,

  /**
   * The date this record's `repos` fields were last updated.
   */
  reposDate: Timestamp,

  /**
   * An array of METS (Metadata Encoding and Transmission Standard)
   * records associated with this package.
   */
  METS: z.array(
    z.object({
      /**
       * The MD5 checksum of the METS file.
       */
      md5: MD5,

      /**
       * The relative path to the METS file in the package.
       */
      path: UnixFilePath,
    })
  ),

  /**
   * Date that the package's METS records were updated in the AIP manifest.
   */
  METSManifestDate: Timestamp,

  /**
   * Date when this record's `METS` fields were last updated.
   */
  METSDate: Timestamp,

  /**
   * Date when this record was last updated.
   */
  updated: Timestamp,

  /**
   * Request for and result of a Smelter operation on this package.
   */
  smelt: ProcessUpdate.optional(),

  /**
   * A record of the staff member who caused this record to be updated.
   */
  staff: StaffUpdate.optional(),
});

export type LegacyPackage = z.infer<typeof LegacyPackage>;
