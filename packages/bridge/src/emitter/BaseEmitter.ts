import type { EventsType } from '../common'

import type { Emitter } from './Emitter'

export class BaseEmitter<E extends EventsType> implements Emitter<E> {
  private _listeners: Partial<Record<keyof E, Set<(data: any) => void>>>

  constructor() {
    this._listeners = {}
  }

  /**
   * @inheritdoc
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
   * @inheritdoc
   */
  public off<K extends keyof E>(eventName: K, listener: (data: E[K]) => void) {
    const listeners = this._listeners[eventName]

    if (!listeners) {
      return
    }

    listeners.delete(listener)
  }

  /**
   * @inheritdoc
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
  protected emit<K extends keyof E>(eventName: K, data?: E[K]) {
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
