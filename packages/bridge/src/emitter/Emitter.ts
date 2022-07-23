import type { EventsType } from '../common'

export interface Emitter<E extends EventsType = EventsType> {
  /**
   * Add a listener to a specific event.
   *
   * @param eventName - The name of the event
   * @param listener - A listener function that takes as parameter the payload of the event
   */
  on<K extends keyof E>(eventName: K, listener: (data: E[K]) => void): void

  /**
   * Remove a listener from a specific event.
   *
   * @param eventName - The name of the event
   * @param listener - A listener function that had been added previously
   */
  off<K extends keyof E>(eventName: K, listener: (data: E[K]) => void): void

  /**
   * Add a listener to a specific event, that will only be invoked once
   *
   * @remarks
   *
   * After the first occurrence of the specified event, the listener will be invoked and
   * immediately removed.
   *
   * @param eventName - The name of the event
   */
  once<K extends keyof E>(eventName: K): Promise<E[K]>
}
