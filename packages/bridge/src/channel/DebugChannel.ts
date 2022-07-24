import type { Callable, Callback, Unsubscribe } from '../common'
import { debug } from '../utils'

import type { Channel } from './Channel'

export class DebugChannel implements Channel {
  private subscriptionCount = 0
  private debugListener: Unsubscribe | null = null
  private logger: Callable<any[], void>

  constructor(
    private readonly channel: Channel,
    logger?: Callable<any[], void>,
  ) {
    this.logger = logger ?? debug('js-bridge')
  }

  postMessage(message: unknown): void {
    this.logger('outgoing message', message)
    this.channel.postMessage(message)
  }

  addMessageListener(callback: Callback<MessageEvent<any>>): Unsubscribe {
    if (this.subscriptionCount++ === 0) {
      this.debugListener = this.channel.addMessageListener((message) => {
        this.logger('incoming message', message.data)
      })
    }

    const unsubscribe = this.channel.addMessageListener(callback)

    return () => {
      unsubscribe()

      if (--this.subscriptionCount === 0) {
        this.debugListener?.()
        this.debugListener = null
      }
    }
  }
}
