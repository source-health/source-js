import type { SourceConfiguration } from '../SourceConfiguration'
import type { BaseElementEvents } from '../utils/types'

import { SourceElement } from './SourceElement'

export interface FormEvents extends BaseElementEvents {
  /**
   * Fired when a form response is submitted
   */
  submitted: {
    exitScreen: {
      key: string
    }
    values: Record<string, unknown>
  }
}

export interface FormOptions {
  /**
   * Provide a formId (or key) into the frame
   */
  form: string

  /**
   * Whether to render the form in preview mode. When running in preview mode, forms will
   * render the latest saved version, not necessarily the last published version. Additionally,
   * when running in preview mode, form flows will process as usual but responses will not be
   * submitted.
   */
  preview?: boolean
}

export class FormElement extends SourceElement<FormOptions, FormEvents> {
  constructor(source: SourceConfiguration, options: FormOptions) {
    super(source, options, {
      path: '/elements/form',
      element: 'form',
    })
  }
}
