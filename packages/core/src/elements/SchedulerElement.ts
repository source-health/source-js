import type { SourceConfiguration } from '../SourceConfiguration'
import type { BaseElementEvents } from '../utils/types'

import { SourceElement } from './SourceElement'

export interface SchedulerEvents extends BaseElementEvents {
  /**
   * Fired when a new appointment is booked
   */
  booked: { id: string }
}

export interface SchedulerOptions {
  /**
   * Provide an appointment type into the frame
   */
  appointmentType: string
}

export class SchedulerElement extends SourceElement<
  SchedulerOptions,
  SchedulerEvents
> {
  constructor(source: SourceConfiguration, options: SchedulerOptions) {
    super(source, options, {
      path: '/elements/scheduler',
      element: 'scheduler',
    })
  }
}
