export interface BaseElementEvents {
  /**
   *
   */
  hello: { key: string }
  /**
   * Dispatched when the element becomes ready
   */
  ready: unknown

  /**
   * Dispatched when an error is encountered
   */
  error: Error | any
}

/**
 * Type signature for an event handler
 */
export type Listener<T> = (event: T) => void

/**
 * Type signature for a request/response handler
 */
export type Handler<I, O> = (input: I) => O | Promise<O>
