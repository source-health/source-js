export const MARKER = '@bridge'

export enum BridgeStatus {
  Idle = 'idle',
  Connecting = 'connecting',
  Connected = 'connected',
}

export type IdType = number
export type KeyType = string

/**
 * @internal
 */
export type MethodsType = Record<KeyType, Callable<any[], ValueOrPromise<any>>>

/**
 * @internal
 */
export type EventsType = Record<KeyType, any>

/**
 * @internal
 */
export type Callback<T> = (value: T) => void

/**
 * @internal
 */
export type Callable<A extends Array<any>, R = void> = (...args: A) => R

/**
 * @internal
 */
export type Unsubscribe = () => void

/**
 * @internal
 */
export type ValueOrPromise<T> = T | Promise<T>

/**
 * @internal
 */
export type InnerType<T extends ValueOrPromise<any>> = T extends Promise<
  infer U
>
  ? U
  : T

/**
 * @internal
 */
export type PromisePair<T = any> = [Callback<T>, Callback<unknown>]

export function createUniqueIdFn() {
  let __id = 0
  return function () {
    const id = __id
    __id += 1
    return id
  }
}
