import { z } from "zod";
import { MD5 } from "../util/MD5.js";
import { Noid } from "../util/Noid.js";
import { ProcessResult, ProcessUpdate } from "../util/ProcessUpdate.js";
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
   * The Slug chosen by staff for the associated Manifest.
   */
  slug: Slug.optional(),

  /**
   * Request for a Smelter operation on this package.
   */
  smelt: ProcessUpdate.optional(),

  /**
   * A record of the staff member who caused this record to be updated.
   */
  staff: StaffUpdate.optional(),
});

export type LegacyPackage = z.infer<typeof LegacyPackage>;

interface WithId {
  id: Slug;
  repos: string[];
  ingestDate: Timestamp;
  noid: Noid | null;
}
interface WithRequest extends WithId {
  slug: Slug;
  requestDate: Timestamp;
}
interface WithProcess extends WithRequest {
  processDate: Timestamp;
  message: string;
}

interface NotFoundStatus {
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
  | NotFoundStatus
  | NewStatus
  | ProcessingStatus
  | SuccessStatus
  | FailureStatus;

/**
 * Determines the status of a LegacyPackage object.
 * @param lp The LegacyPackage object.
 * @param noid The result of a Noid lookup for `lp`'s `id` or `slug`.
 */
export const importStatus = (
  lp: LegacyPackage | undefined,
  noid?: Noid
): ImportStatus => {
  if (!lp) return { status: "not-found" };
  const { id, repos, reposManifestDate: ingestDate, slug, smelt } = lp;
  const response = { id, repos, ingestDate, noid: noid || null };
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
