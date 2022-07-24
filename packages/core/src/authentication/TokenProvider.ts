import type { Authentication } from './Authentication'

export class TokenProvider implements Authentication {
  private cachedToken: Promise<string | null> | null = null
  private knownExpiration: number | null = null

  constructor(private readonly callback: () => Promise<string>) {}

  public token(): Promise<string | null> {
    if (this.knownExpiration) {
      const currentTime = Date.now()
      if (currentTime >= this.knownExpiration) {
        this.cachedToken = null
      }
    }

    if (this.cachedToken) {
      return this.cachedToken
    }

    return (this.cachedToken = this.callback().then((token) => {
      const [, payload] = token.split('.')

      try {
        const payloadContents = window.atob(payload)
        const parsedPayload = JSON.parse(payloadContents)

        if (parsedPayload.exp) {
          const parsedExpiration = parseFloat(parsedPayload.exp)
          if (!isNaN(parsedExpiration)) {
            const parsedDate = new Date(parsedPayload.exp * 1000)
            if (!isNaN(parsedDate.getTime())) {
              this.knownExpiration = parsedDate.getTime()
            }
          }
        }

        return token
      } catch (ex) {
        throw new Error('Malformed JWT received')
      }
    }))
  }
}
