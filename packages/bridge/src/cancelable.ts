import type { Callable, Unsubscribe } from './common'

export type Cancelable = {
  /**
   * Calls all onCancel callbacks.
   */
  cancel(error?: Error): void
  /**
   * Registers a callback to be called when cancel is called.
   */
  onCancel(callback: Callable<[Error | void], void>): Unsubscribe
}

/**
 * Creates a new cancelation token
 *
 * Cancelation tokens can be used to indicate the cancelation of a request. When created, they
 * track a list of callbacks to be invoked when the operation is canceled.
 */
export function createCancelToken(): Cancelable {
  const callbacks: Callable<[Error | void], void>[] = []
  let canceled = false

  return {
    cancel(error) {
      if (!canceled) {
        canceled = true
        callbacks.forEach((callback) => {
          callback(error)
        })
        callbacks.splice(0, callbacks.length)
      }
    },
    onCancel(callback) {
      if (canceled) {
        callback()
        return () => void 0
      }

      callbacks.push(callback)
      return () => {
        const targetIndex = callbacks.indexOf(callback)
        if (targetIndex > -1) {
          callbacks.splice(targetIndex, 1)
        }
      }
    },
  }
}
