import { BodyInit } from "node-fetch";

/**
 * Options accepted by the Swift.Client constructor.
 */
export type ClientOptions = {
  /** Server hosting Swift. */
  server: string;
  /** Swift user. */
  user: string;
  /** Swift user's password. */
  password: string;
  /** Account name. Defaults to `AUTH_$user`. */
  account?: string;
};

/**
 * Options that govern how lists of containers or objects are returned.
 */
export interface ListOptions {
  /**
   * For an integer value `n`, limits the number of results to `n`.
   */
  limit?: number;
  /**
   * For a string value `x`, constrains the list to items whose names are
   * greater than `x`.
   */
  marker?: string;
  /**
   * For a string value `x`, constrains the list to items whose names are
   * less than `x`.
   */
  end_marker?: string;
  /**
   * Only objects with this prefix will be returned. When combined with a
   * `delimiter` query, this enables API users to simulate and traverse the
   * objects in a container as if they were in a directory tree.
   */
  prefix?: string;
  /**
   * The delimiter is a single character used to split object names to present
   * a pseudo-directory hierarchy of objects. When combined with a `prefix`
   * query, this enables API users to simulate and traverse the objects in a
   * container as if they were in a directory tree.
   */
  delimiter?: string;
}

export interface ClientInterface {
  /**
   * @link https://docs.openstack.org/api-ref/object-store/#list-activated-capabilities
   * List the activated capabilities of this version of the OpenStack Object Storage API.
   * @returns An object containing the requested information.
   */
  info: () => Promise<Record<string, unknown>>;
  /**
   * Lists containers, sorted by name, in the account.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-account-details-and-list-containers
   * @param options Options that govern how the container list is generated.
   */
  listContainers: (
    options?: ListOptions
  ) => Promise<JSONResponse<ContainerListing[]>>;
  /**
   * Creates, updates, or deletes account metadata.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-update-or-delete-account-metadata
   * @param metadata Metadata keys and values. Metadata key-value pairs will
   * be sent as headers with `X-Account-Meta-` prepended to the key.
   */
  postMetadata: (metadata: Record<string, string>) => Promise<Response>;
  /**
   * Shows metadata for an account.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-account-metadata
   */
  getMetadata: () => Promise<Response>;
  /**
   * Creates a container. Does not support setting headers outside of `X-Container-Meta`.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-container
   * @param metadata Container metadata. Keys will have `X-Container-Meta-` prepended.
   */
  createContainer: (
    container: string,
    metadata?: Record<string, string>
  ) => Promise<Response>;
  /**
   * Deletes an empty container. This operation fails unless the container is empty. An empty container has no objects.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#delete-container
   */
  deleteContainer: (container: string) => Promise<Response>;
  /**
   * Returns an interface to `container`.
   */
  container: (container: string) => ContainerInterface;
}

export interface ContainerInterface {
  /**
   * Shows details for a container and lists objects, sorted by name, in the container.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-container-details-and-list-objects
   * @param options Options that govern how the object list is generated.
   */
  listObjects: (
    options?: ListOptions
  ) => Promise<JSONResponse<ObjectListing[]>>;
  /**
   * Creates, updates, or deletes custom metadata for a container.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-update-or-delete-container-metadata
   * @param metadata Container metadata. Keys will have `X-Container-Meta-` prepended.
   */
  postMetadata: (metadata: Record<string, string>) => Promise<Response>;
  /**
   * Shows container metadata, including the number of objects and the total bytes of all objects stored in the container.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-container-metadata
   */
  getMetadata: () => Promise<Response>;
  /**
   * Downloads the object content and gets the object metadata.
   * The object content is made available as a NodeJS ReadableStream.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#get-object-content-and-metadata
   * @param object The unique name for the object.
   */
  getObject: (object: string) => Promise<StreamResponse>;
  /**
   * Downloads the object content and gets the object metadata.
   * The object content is parsed as JSON into type T.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#get-object-content-and-metadata
   * @param object The unique name for the object.
   */
  getObjectAsJSON: <T>(object: string) => Promise<JSONResponse<T>>;
  /**
   * Creates an object with data content and metadata, or replaces an existing object with data content and metadata.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-or-replace-object
   * @param object The unique name for the object.
   * @param args Object arguments.
   */
  putObject: (
    object: string,
    args: {
      /** Object contents. */
      data: BodyInit;
      /** Object content type. */
      contentType?: string;
      /** MD5 checksum asserted for the object. */
      etag?: string;
      /** Object metadata, sent as headers with `x-object-meta-` prepended to its keys. */
      metadata?: Record<string, string>;
    }
  ) => Promise<Response>;
  /**
   * Copies an object to another object in the object store.
   * Does not yet support fresh metadata, symlinks, or multipart-manifest.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#copy-object
   * @param object The unique name for the object.
   * @param destContainer The container containing the destination object.
   * @param destObject The name of the destination object.
   */
  copyObject: (
    object: string,
    destContainer: string,
    destObject: string
  ) => Promise<Response>;
  /**
   * Permanently deletes an object from the object store.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#delete-object
   * @param object The unique name for the object.
   */
  deleteObject: (object: string) => Promise<Response>;
  /**
   * Shows object metadata.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-object-metadata
   * @param object The unique name for the object.
   */
  getObjectMetadata: (object: string) => Promise<Response>;
  /**
   * Creates or updates object metadata.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-or-update-object-metadata
   * @param object The unique name for the object.
   * @param metadata Object metadata. Keys will have `X-Object-Meta-` prepended.
   */
  postObjectMetadata: (
    object: string,
    metadata: Record<string, string>
  ) => Promise<Response>;
}

/**
 * Data returned when listing an account's containers.
 */
export interface ContainerListing {
  /** The number of objects in the container. */
  count: number;
  /** The total number of bytes that are stored in Object Storage for the container. */
  bytes: number;
  /** The name of the container. */
  name: string;
  /** The ISO 8601 timestamp of when the container was last modified. */
  last_modified: string;
}

export interface ObjectListing {
  /** The MD5 checksum value of the object content. */
  hash: string;
  /** The ISO8601 timestamp of when the object was last modified. */
  last_modified: string;
  /** The total number of bytes that are stored in Object Storage for the object. */
  bytes: number;
  /** The name of the object. */
  name: string;
  /** The content type of the object. */
  content_type: string;
  /** This field exists only when the object is symlink. This is the target path of the symlink object. */
  symlink_path?: string;
}

export type Entity = "account" | "container" | "object";

/** A SwiftClient response, with no content. */
export type Response = {
  /** Response HTTP status code. */
  code: number;
  /** Date that Swift responded to the request. */
  date: Date;
  /** Date that the entity was "originally created as a current version". */
  timestamp: Date;
  /** Unique transaction ID for this request. */
  transactionId: string;
  /** ETag header. Will be empty for non-objects. */
  etag: string;
  /** Last-Modified header. Will be empty for non-objects. */
  lastModified: Date;
  /** Content-Type header. */
  contentType: string;
  /** Returns the given entity header value (e.g `x-account-${name}`) */
  header: (name: string) => string | null;
  /** Returns the given entity meta header (e.g. `x-account-meta-${name}`) */
  metaHeader: (name: string) => string | null;
};

/** A SwiftClient response, with content parsed into type T. */
export type JSONResponse<T> = Response & {
  content: T;
};

/** A SwiftClient response, with content streamed. */
export type StreamResponse = Response & {
  content: NodeJS.ReadableStream;
};
