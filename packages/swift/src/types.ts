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

export interface AccountInterface {
  /**
   * Lists containers, sorted by name, in the account.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-account-details-and-list-containers
   * @param options Options that govern how the container list is generated.
   */
  get: (options?: ListOptions) => Promise<JSONResponse<ContainerListing[]>>;
  /**
   * Creates, updates, or deletes account metadata.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-update-or-delete-account-metadata
   * @param metadata Metadata keys and values. Metadata key-value pairs will
   * be sent as headers with `X-Account-Meta-` prepended to the key.
   */
  post: (metadata: Record<string, string>) => Promise<Response>;
  /**
   * Shows metadata for an account.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-account-metadata
   */
  head: () => Promise<Response>;
  /**
   * Returns an interface to `container`.
   */
  container: (container: string) => ContainerInterface;
  /**
   * Returns an interface to `object` in `container`.
   */
  object: (container: string, object: string) => ObjectInterface;
}

export interface ContainerInterface {
  /**
   * Shows details for a container and lists objects, sorted by name, in the container.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-container-details-and-list-objects
   * @param options Options that govern how the object list is generated.
   */
  get: (options?: ListOptions) => Promise<JSONResponse<ObjectListing[]>>;
  /**
   * Creates a container. Does not support setting headers outside of `X-Container-Meta`.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-container
   * @param metadata Container metadata. Keys will have `X-Container-Meta-` prepended.
   */
  put: (metadata?: Record<string, string>) => Promise<Response>;
  /**
   * Creates, updates, or deletes custom metadata for a container.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-update-or-delete-container-metadata
   * @param metadata Container metadata. Keys will have `X-Container-Meta-` prepended.
   */
  post: (metadata: Record<string, string>) => Promise<Response>;
  /**
   * Shows container metadata, including the number of objects and the total bytes of all objects stored in the container.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-container-metadata
   */
  head: () => Promise<Response>;
  /**
   * Deletes an empty container. This operation fails unless the container is empty. An empty container has no objects.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#delete-container
   */
  delete: () => Promise<Response>;
  /**
   * Returns an interface to `object`.
   */
  object: (object: string) => ObjectInterface;
}

/**
 * Data returned when listing an account's containers.
 */
export interface ContainerListing {
  /** The number of objects in the container. */
  count: number;
  /** The total number of bytes that are stored in Object Storage for the account. */
  bytes: number;
  /** The name of the container. */
  name: string;
  /** When the container was last modified. */
  last_modified: string;
}

export interface ObjectInterface {
  /**
   * Downloads the object content and gets the object metadata.
   * The object content is made available as a NodeJS ReadableStream.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#get-object-content-and-metadata
   */
  get: () => Promise<StreamResponse>;
  /**
   * Downloads the object content and gets the object metadata.
   * The object content is parsed as JSON into type T.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#get-object-content-and-metadata
   */
  getAsJSON: <T>() => Promise<JSONResponse<T>>;
  //getAsXML: <T>() => Promise<XMLResponse<T>>
  /**
   * Creates an object with data content and metadata, or replaces an existing object with data content and metadata.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-or-replace-object
   * @param data Object data.
   * @param metadata Object metadata. Keys will have `X-Object-Meta-` prepended.
   */
  put: (
    data: NodeJS.ReadableStream,
    metadata?: Record<string, string>
  ) => Promise<Response>;
  /**
   * Copies an object to another object in the object store.
   * Does not yet support fresh metadata, symlinks, or multipart-manifest.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#copy-object
   * @param destContainer The container containing the destination object.
   * @param destObject The name of the destination object.
   */
  copy: (destContainer: string, destObject: string) => Promise<Response>;
  /**
   * Permanently deletes an object from the object store.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#delete-object
   */
  delete: () => Promise<Response>;
  /**
   * Shows object metadata.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#show-object-metadata
   */
  head: () => Promise<Response>;
  /**
   * Creates or updates object metadata.
   * @link https://docs.openstack.org/api-ref/object-store/?expanded=#create-or-update-object-metadata
   * @param metadata Object metadata. Keys will have `X-Object-Meta-` prepended.
   */
  post: (metadata: Record<string, string>) => Promise<Response>;
}

export interface ObjectListing {
  hash: string;
  last_modified: string;
  bytes: number;
  name: string;
  content_type: string;
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
