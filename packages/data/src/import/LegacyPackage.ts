import { z } from "zod";
import { MD5 } from "../util/MD5.js";
import { ProcessRequest, ProcessResult } from "../util/ProcessUpdate.js";
import { Slug } from "../util/Slug.js";
import { StaffUpdate } from "../util/StaffUpdate.js";
import { Timestamp } from "../util/Timestamp.js";
import { UnixFilePath } from "../util/UnixFilePath.js";

/**
 * A record of a package in the legacy preservation platform
 * that the Access Platform can import.
 * This package has never been imported.
 */
export const UnsmeltedLegacyPackage = z.object({
  /**
   * The package's AIP id.
   */
  id: Slug,

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
});

export type UnsmeltedLegacyPackage = z.infer<typeof UnsmeltedLegacyPackage>;

/**
 * A record of a package in the legacy preservation platform
 * that the Access Platform can import.
 * This package is in the process of being imported.
 */
export const SmeltingLegacyPackage = UnsmeltedLegacyPackage.merge(
  z.object({
    /**
     * The Slug chosen by staff for the associated Manifest.
     */
    slug: Slug,

    /**
     * Request for a Smelter operation on this package.
     */
    smelt: ProcessRequest,

    /**
     * A record of the staff member who caused this record to be updated.
     */
    staff: StaffUpdate.optional(),
  })
);

export type SmeltingLegacyPackage = z.infer<typeof SmeltingLegacyPackage>;

/**
 * A record of a package in the legacy preservation platform
 * that the Access Platform can import.
 * This package has either been imported or the import process for it has failed.
 */
export const SmeltedLegacyPackage = SmeltingLegacyPackage.merge(
  z.object({
    /**
     * Result of a Smelter operation on this package.
     */
    smelt: ProcessResult,
  })
);

export type SmeltedLegacyPackage = z.infer<typeof SmeltedLegacyPackage>;

/**
 * A record of a package in the legacy preservation platform
 * that the Access Platform can import.
 */
export const LegacyPackage = z.union([
  UnsmeltedLegacyPackage,
  SmeltingLegacyPackage,
  SmeltedLegacyPackage,
]);

export type LegacyPackage = z.infer<typeof LegacyPackage>;
