import type { Authentication } from './Authentication'

export class NoopAuthentication implements Authentication {
  public token(): Promise<string | null> {
    return Promise.resolve(null)
  }
}
