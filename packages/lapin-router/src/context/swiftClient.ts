import { Env } from "@crkn-rcdr/access-env"
const SwiftClient = require('openstack-swift-client')

export function initializeSwiftClient() {
  const { swift } = Env.parse(process.env)
  const server = swift.server;
  const accountName = swift.account ?? `AUTH_${swift.user}`;
  const authenticator = new SwiftClient.SwiftAuthenticator(
    `${server}/v1/${accountName}`, 
    swift.user, 
    swift.password
  )
  const client = new SwiftClient(authenticator)
  return {
    accessFiles: client.container("access-files"),
    accessMetadata: client.container("access-metadata"),
  }
}