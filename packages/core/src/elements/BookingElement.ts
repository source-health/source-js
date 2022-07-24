import type { SourceConfiguration } from '../SourceConfiguration'
import type { BaseElementEvents } from '../utils/types'

import { SourceElement } from './SourceElement'

export interface BookingEvents extends BaseElementEvents {
  /**
   * Fired when the visibility of the internal content changes
   */
  toggle: boolean
}

export interface BookingOptions {
  /**
   * Provide an appointment type into the frame
   */
  appointmentType: string
}

export class BookingElement extends SourceElement<
  BookingOptions,
  BookingEvents
> {
  constructor(source: SourceConfiguration, options: BookingOptions) {
    super(source, options, { path: '/book', element: 'book' })
  }
}
