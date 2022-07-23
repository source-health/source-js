import type { Callable } from './common'

export function generateId(): string {
  return Math.random().toString(32)
}

/**
 * Create a logger function with a specific namespace
 *
 * @param namespace - The namespace will be prepended to all the arguments passed to the logger function
 * @param log - The underlying logger (`console.log` by default)
 *
 * @public
 *
 */
export function debug(namespace: string, log?: (...data: any[]) => void) {
  log = log || console.debug || console.log || (() => void 0)
  return (...data: any[]) => {
    log?.(namespace, ...data)
  }
}

export function isAcceptableMessageEvent(
  event: MessageEvent,
  remoteWindow: Window,
  acceptedOrigin: string,
) {
  const { source, origin } = event

  if (source !== remoteWindow) {
    return false
  }

  if (origin !== acceptedOrigin && acceptedOrigin !== '*') {
    return false
  }

  return true
}

export function wrappedInvoke<T extends Callable<any[], any>>(
  method: T,
  sidecar: Callable<[], unknown>,
): Callable<Parameters<T>, ReturnType<T>> {
  return (...args: Parameters<T>): ReturnType<T> => {
    sidecar()
    return method(...args)
  }
}
