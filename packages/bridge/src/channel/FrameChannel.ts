import type { Callback, Unsubscribe } from '../common'

import type { Channel } from './Channel'

export interface FrameChannelOptions {
  /**
   * The origin from which to expect messages
   *
   * Messages received from other origins will not be bubbled up to the listener attached
   * to this channel.
   */
  expectedOrigin?: string
}

export class FrameChannel implements Channel {
  constructor(
    private readonly local: Window,
    private readonly remote: Window,
    private readonly options: FrameChannelOptions = {},
  ) {}

  public emit(message: unknown): void {
    this.remote.postMessage(message, this.options.expectedOrigin ?? '*')
  }

  public listen(callback: Callback<MessageEvent<any>>): Unsubscribe {
    const handler = (event: MessageEvent) => {
      callback(event)
    }

    this.local.addEventListener('message', handler)
    return () => this.local.removeEventListener('message', handler)
  }
}
