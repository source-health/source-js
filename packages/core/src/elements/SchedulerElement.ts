import type { SourceConfiguration } from '../SourceConfiguration'
import type { BaseElementEvents } from '../utils/types'

import { SourceElement } from './SourceElement'

export interface SchedulerEvents extends BaseElementEvents {
  /**
   * Fired when a new appointment is booked
   */
  booked: { id: string }

  error: {
    fatal: boolean
    step: string
    type: string
    message?: string
  }
}

export interface SchedulerOptions {
  /**
   * Provide an appointment type into the frame
   */
  appointmentType: string

  /**
   * Provide the appointment that is being rescheduled
   */
  reschedulingAppointment?: string | null

  /**
   * Specify whether or not to hide the reason for visit input (default: false)
   */
  hideReasonForVisitInput?: boolean
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
