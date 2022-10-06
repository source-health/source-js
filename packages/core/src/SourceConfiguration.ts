import { BaseEmitter } from '@source-health/js-bridge'

import type {
  Authentication,
  AuthenticationToken,
} from './authentication/Authentication'
import type { Appearance } from './types'

export interface SourceConfigurationOptions {
  /**
   * Endpoint to access the Source API
   */
  endpoint: string

  /**
   * Domain for hosted, embeddable widgets
   */
  domain: string

  /**
   * Authentication for this Source instance
   */
  authentication: Authentication

  /**
   * Authentication for this Source instance
   */
  appearance?: Appearance
}

export interface SourceConfigurationEvents {
  updated: Pick<SourceConfigurationOptions, 'appearance'>
}

export class SourceConfiguration extends BaseEmitter<SourceConfigurationEvents> {
  constructor(private readonly options: SourceConfigurationOptions) {
    super()
  }

  public update(
    options: Partial<Pick<SourceConfigurationOptions, 'appearance'>>,
  ) {
    this.options.appearance = options.appearance ?? this.options.appearance

    this.emit('updated', {
      appearance: this.options.appearance,
    })
  }

  public getEndpoint(): string {
    return this.options.endpoint
  }

  public getDomain(): string {
    return this.options.domain
  }

  public getAppearance(): Appearance {
    return this.options.appearance ?? {}
  }

  public getToken(): Promise<AuthenticationToken | string | null> {
    return this.options.authentication.token()
  }
}
