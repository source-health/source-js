import type { Callback, Unsubscribe } from '../common'
import { isAcceptableMessageEvent } from '../utils'

import type { Channel } from './Channel'

export interface WindowChannelOptions {
  /**
   * Remote window to which we should connect
   */
  remoteWindow: Window

  /**
   * Local window to bind to, defaults to the Window global
   */
  localWindow?: Window

  /**
   * The origin from which to expect messages
   *
   * Messages received from other origins will not be bubbled up to the listener attached
   * to this channel.
   */
  expectedOrigin?: string
}

export class WindowChannel implements Channel {
  private readonly localWindow: Window
  private readonly remoteWindow: Window
  private readonly expectedOrigin: string

  constructor(options: WindowChannelOptions) {
    this.localWindow = options.localWindow ?? window
    this.remoteWindow = options.remoteWindow
    this.expectedOrigin = options.expectedOrigin ?? '*'
  }

  public postMessage(message: unknown): void {
    this.remoteWindow.postMessage(message, this.expectedOrigin)
  }

  public addMessageListener(
    callback: Callback<MessageEvent<any>>,
  ): Unsubscribe {
    const handler = (event: MessageEvent) => {
      const isMessageAcceptable = isAcceptableMessageEvent(
        event,
        this.remoteWindow,
        this.expectedOrigin,
      )

      if (!isMessageAcceptable) {
        return
      }

      callback(event)
    }

    this.localWindow.addEventListener('message', handler)
    return () => this.localWindow.removeEventListener('message', handler)
  }
}
