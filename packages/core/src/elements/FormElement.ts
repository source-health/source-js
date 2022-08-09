import type { SourceConfiguration } from '../SourceConfiguration'
import type { BaseElementEvents } from '../utils/types'

import { SourceElement } from './SourceElement'

export interface FormEvents extends BaseElementEvents {
  /**
   * Fired when a form response is submitted
   */
  submitted: { id: string }
}

export interface FormOptions {
  /**
   * Provide a formId (or key) into the frame
   */
  formId: string
}

export class FormElement extends SourceElement<FormOptions, FormEvents> {
  constructor(source: SourceConfiguration, options: FormOptions) {
    super(source, options, {
      path: '/elements/form',
      element: 'form',
    })
  }
}
