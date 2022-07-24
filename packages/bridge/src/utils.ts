import type { Callable } from './common'

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

/**
 * Determines if a message is an accepable message (i.e. passes security checks)
 *
 * It compares the source against the remote window from which we're expecting a message, and evaluates that the
 * origin matches our expectations as well.
 *
 * @param event the message event that was received
 * @param remoteWindow the window from which we expect the message to originate
 * @param acceptedOrigin the accepted message origin (you may pass * to allow all messages)
 * @returns
 */
export function isAcceptableMessageEvent(
  event: MessageEvent,
  remoteWindow: Window,
  acceptedOrigin: string,
  disableSourceCheck = false,
) {
  const { source, origin } = event

  if (!disableSourceCheck && source !== remoteWindow) {
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
