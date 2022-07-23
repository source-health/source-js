import type { Callback, Unsubscribe } from '../common'

export interface Channel {
  /**
   * Emits a message over the channel
   *
   * Channel interfaces can take any JSON serializable object to transmit over the
   * bridge. Serialization and deserialization is handled transparently by the channel.
   */
  postMessage(message: unknown): void

  /**
   * Listens to messages sent over a channel
   */
  addMessageListener(callback: Callback<MessageEvent>): Unsubscribe
}
