export function createConnectEndpoint(base: string, path: string): URL {
  return new URL(path, base)
}
