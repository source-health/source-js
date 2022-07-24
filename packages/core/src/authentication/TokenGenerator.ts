import { createHmac } from 'crypto'

export interface TokenClaims {
  /**
   * Member for which a token is being generated. Must be a valid Source Member ID, beginning with `mem_`.
   */
  member: string

  /**
   * Expiration date for the token that is generated. Must be no more han 24 hours from the time of generation.
   */
  expiration: Date

  /**
   * Scopes that should be granted to the token. These are not currently checked by the API, but will be soon.
   */
  scopes?: string[]
}

export class TokenGenerator {
  /**
   * Create a TokenGenerator instance
   *
   * @param keyId Source API Key ID
   * @param secret Source API Key Secret
   */
  constructor(
    private readonly keyId: string,
    private readonly secret: string,
  ) {}

  /**
   * Generates a Member token with the provided claims
   *
   * This class should *only* be used in a server side context where tokens can be securely generated
   * and passed into the browser for use.
   *
   * @param claims claims for the associated token
   * @returns a signed JWT token string compatible with the Source Experience API
   */
  public generate(claims: TokenClaims): string {
    const headers = JSON.stringify({
      kid: this.keyId,
      alg: 'HS256',
    })

    const payload = JSON.stringify({
      sub: claims.member,
      iat: Math.round(Date.now() / 1000),
      exp: Math.round(claims.expiration.getTime() / 1000),
      scopes: claims.scopes ?? [],
    })

    const encodedPrefix = [
      Buffer.from(headers).toString('base64url'),
      Buffer.from(payload).toString('base64url'),
    ].join('.')

    const signature = createHmac('sha256', this.secret)
      .update(encodedPrefix)
      .digest('base64url')

    return `${encodedPrefix}.${signature}`
  }
}
