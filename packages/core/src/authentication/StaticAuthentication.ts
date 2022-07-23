import type { Authentication } from './Authentication'

export class StaticAuthentication implements Authentication {
  constructor(private readonly tokenStr: string | null) {}

  public token(): Promise<string | null> {
    return Promise.resolve(this.tokenStr)
  }
}
