import type { EventsType } from './common'

export class Emitter<E extends EventsType> {
  private _listeners: Partial<Record<keyof E, Set<(data: any) => void>>>

  constructor() {
    this._listeners = {}
  }

  /**
   * Add a listener to a specific event.
   *
   * @param eventName - The name of the event
   * @param listener - A listener function that takes as parameter the payload of the event
   */
  public on<K extends keyof E>(eventName: K, listener: (data: E[K]) => void) {
    let listeners = this._listeners[eventName]

    if (!listeners) {
      listeners = new Set()
      this._listeners[eventName] = listeners
    }

    listeners.add(listener)
  }

  /**
   * Remove a listener from a specific event.
   *
   * @param eventName - The name of the event
   * @param listener - A listener function that had been added previously
   */
  public off<K extends keyof E>(eventName: K, listener: (data: E[K]) => void) {
    const listeners = this._listeners[eventName]

    if (!listeners) {
      return
    }

    listeners.delete(listener)
  }

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
  public once<K extends keyof E>(eventName: K): Promise<E[K]> {
    return new Promise((resolve) => {
      const listener = (data: E[K]) => {
        this.off(eventName, listener)
        resolve(data)
      }

      this.on(eventName, listener)
    })
  }

  /** @internal */
  emit<K extends keyof E>(eventName: K, data: E[K]) {
    const listeners = this._listeners[eventName]

    if (!listeners) {
      return
    }

    listeners.forEach((listener) => {
      listener(data)
    })
  }

  /** @internal */
  protected removeAllListeners() {
    Object.values(this._listeners).forEach((listeners) => {
      if (listeners) {
        listeners.clear()
      }
    })
  }
}
