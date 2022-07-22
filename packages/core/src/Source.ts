import type { Authentication } from './authentication/Authentication'
import { NoopAuthentication } from './authentication/NoopAuthentication'
import type { BookingOptions } from './elements/BookingElement'
import { BookingElement } from './elements/BookingElement'
import type { SourceElement } from './elements/SourceElement'
import { SourceEnvironment } from './environment'

export interface SourceOptions {
  /**
   * Environment in which the Source client is running
   */
  environment?: SourceEnvironment

  /**
   * Authentication for this Source instance
   */
  authentication?: Authentication
}

export class Source {
  /**
   * Authentication instance used when making API calls
   */
  private authentication: Authentication

  /**
   * Environment in which Source will be running
   */
  private environment: SourceEnvironment

  /**
   *
   */
  constructor(readonly options: SourceOptions) {
    this.authentication = options.authentication ?? new NoopAuthentication()
    this.environment = options.environment ?? SourceEnvironment.Production
  }

  /**
   * Create a new Element instance with the provided configuration
   *
   * Elements will not do anything until they're mounted. Once an element is mounted,
   * it will not be cleaned up properly until it's unmounted.
   */
  public element(type: 'booking', options: BookingOptions): BookingElement
  public element(type: 'booking', options: unknown): SourceElement {
    if (type === 'booking') {
      return new BookingElement(this, options as BookingOptions)
    } else {
      throw new Error(`Unrecognized element type: ${type}`)
    }
  }

  /**
   * Returns the current environment
   */
  public getEnvironment(): SourceEnvironment {
    return this.environment
  }

  public getToken(): Promise<string | null> {
    return this.authentication.token()
  }
}
