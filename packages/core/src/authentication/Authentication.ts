export interface AuthenticationToken {
  token: string
  testMode?: boolean
}

export interface Authentication {
  /**
   * Returns a promise that will be resolved when a token is made available
   *
   * Implementations are free to generate tokens however they'd like. If no token is available, this
   * method should return null.
   */
  token(): Promise<AuthenticationToken | string | null>
}
