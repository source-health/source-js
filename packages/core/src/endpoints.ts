import { SourceEnvironment } from './environment'

const connectEndpoints = {
  [SourceEnvironment.Production]: '',
  [SourceEnvironment.Staging]: 'http://localhost:3002/',
}

export function createConnectEndpoint(environment: SourceEnvironment, path: string): URL {
  return new URL(path, connectEndpoints[environment])
}
