import { z } from "zod";
import { MD5 } from "../util/MD5.js";
import { Noid } from "../util/Noid.js";
import { ProcessUpdate, ProcessResult } from "../util/ProcessUpdate.js"; //ProcessUpdate
import { Slug } from "../util/Slug.js";
import { StaffUpdate } from "../util/StaffUpdate.js";
import { Timestamp } from "../util/Timestamp.js";
import { UnixFilePath } from "../util/UnixFilePath.js";

/**
 * A record of a package in the legacy preservation platform
 * that the Access Platform can import.
 */
export const LegacyPackage = z.object({
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
  reposManifestDate: Timestamp.optional(),

  /**
   * The date this record's `repos` fields were last updated.
   */
  reposDate: Timestamp.optional(),

  /**
   * An array of METS (Metadata Encoding and Transmission Standard)
   * records associated with this package.
   */
  METS: z
    .array(
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
    )
    .optional(),

  /**
   * Date that the package's METS records were updated in the AIP manifest.
   */
  METSManifestDate: Timestamp.optional(),

  /**
   * Date when this record's `METS` fields were last updated.
   */
  METSDate: Timestamp.optional(),

  /**
   * Date when this record was last updated.
   */
  updated: Timestamp.optional(),

  /**
   * The Slug chosen by staff for the associated Manifest.
   */
  slug: Slug.optional(),

  /**
   * Request for a Smelter operation on this package.
   */
  smelt: ProcessUpdate.optional(),

  /**
   * Request to extract OCR information from his package.
   */
  ocr: ProcessUpdate.optional(),

  /**
   * A record of the staff member who caused this record to be updated.
   */
  staff: StaffUpdate.optional(),
});

export type LegacyPackage = z.infer<typeof LegacyPackage>;

interface WithId {
  /** The id used to look up the LegacyPackage. */
  id: Slug;
}

interface WithDip extends WithId {
  /** The list of preservation repositories the package can be found at. */
  repos: string[];
  /** The time the package was most recently ingested into the preservation platform. */
  ingestDate: Timestamp | undefined;
  /** The result of checking if `id` resolves to a Noid. */
  noid: Noid | null;
  /** The staff member who made the last update, and when it took place. */
  staff?: StaffUpdate;
}

interface WithRequest extends WithDip {
  /** The slug of the Manifest that the package is imported to. */
  slug: Slug | undefined;
  /** The time the package was requested to be processed. */
  requestDate: Timestamp | undefined;
}

interface WithProcess extends WithRequest {
  /** The time the package was processed. */
  processDate: Timestamp | undefined;
  /** The message returned by the import processor. */
  message: string | undefined;
}
interface NotFoundStatus extends WithId {
  status: "not-found";
}
interface NewStatus extends WithId {
  status: "new";
}
interface ProcessingStatus extends WithRequest {
  status: "processing";
}
interface SuccessStatus extends WithProcess {
  status: "succeeded";
}
interface FailureStatus extends WithProcess {
  status: "failed";
}

export type ImportStatus =
  | SuccessStatus
  | FailureStatus
  | NewStatus
  | ProcessingStatus
  | NotFoundStatus;

/**
 * Determines the status of a LegacyPackage object.
 * @param id The id used to find the LegacyPackage object.
 * @param lp The LegacyPackage object.
 * @param noid The result of a Noid lookup for `lp`'s `id` or `slug`.
 */
export const getImportStatus = (
  id: Slug,
  lp: LegacyPackage | null = null,
  noid: Noid | null = null
): ImportStatus => {
  if (!lp) return { status: "not-found", id };
  const { repos, reposManifestDate: ingestDate, slug, smelt, staff } = lp;
  const response = { id, repos, ingestDate, noid: noid || null, staff };
  if (smelt) {
    const processResponse = {
      ...response,
      slug: slug || "",
      requestDate: smelt.requestDate,
    };
    const processed = ProcessResult.safeParse(smelt);
    if (processed.success) {
      const processedResponse = {
        ...processResponse,
        processDate: processed.data.processDate,
        message: processed.data.message,
      };
      if (processed.data.succeeded) {
        return { status: "succeeded", ...processedResponse };
      } else {
        return { status: "failed", ...processedResponse };
      }
    } else {
      return { status: "processing", ...processResponse };
    }
  } else {
    return { status: "new", ...response };
  }
};
