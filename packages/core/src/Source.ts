import type { SourceConfigurationOptions } from './SourceConfiguration'
import { SourceConfiguration } from './SourceConfiguration'
import { NoopAuthentication } from './authentication/NoopAuthentication'
import type { FormOptions } from './elements/FormElement'
import { FormElement } from './elements/FormElement'
import type { SchedulerOptions } from './elements/SchedulerElement'
import { SchedulerElement } from './elements/SchedulerElement'
import type { SourceElement } from './elements/SourceElement'

export class Source {
  /**
   * Authentication instance used when making API calls
   */
  private readonly configuration: SourceConfiguration

  /**
   * Constructor
   */
  constructor(options: Partial<SourceConfigurationOptions>) {
    this.configuration = new SourceConfiguration({
      endpoint: options.endpoint ?? 'https://api.sourcehealth.com',
      domain: options.domain ?? 'https://embed.connect.sourcehealth.com',
      authentication: options.authentication ?? new NoopAuthentication(),
      appearance: options.appearance,
    })
  }

  /**
   * Create a new Element instance with the provided configuration
   *
   * Elements will not do anything until they're mounted. Once an element is mounted,
   * it will not be cleaned up properly until it's unmounted.
   *
   * @param type the element to create
   * @param options the options for the created element
   */
  public element(type: 'scheduler', options: SchedulerOptions): SchedulerElement
  public element(type: 'form', options: FormOptions): FormElement
  public element(type: string, options: unknown): SourceElement {
    switch (type) {
      case 'scheduler':
        return new SchedulerElement(
          this.configuration,
          options as SchedulerOptions,
        )
      case 'form':
        return new FormElement(this.configuration, options as FormOptions)
      default:
        throw new Error(`Unrecognized element type: ${type}`)
    }
  }

  /**
   * Update the configuration for the Source instance
   *
   * @param options the options to provide to all elements
   */
  public update(
    options: Partial<Pick<SourceConfigurationOptions, 'appearance'>>,
  ) {
    this.configuration.update(options)
  }
}
