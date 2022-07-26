import type { BridgeStatus } from './common'

export class BridgeError extends Error {
  static invalidStatus(
    expectedStatus: BridgeStatus,
    actualStatus: BridgeStatus,
  ): Error {
    return new BridgeError(
      `Bridge in invalid state. Expected ${expectedStatus}, but actual state was ${actualStatus}`,
    )
  }

  static callTimeout(methodName: string, timeoutDuration: number): Error {
    return new BridgeError(
      `Call to remote method ${methodName} timed out after ${timeoutDuration}ms`,
    )
  }

  static unknownMethod(methodName: string): Error {
    return new BridgeError(`Call to unknown method ${methodName}`)
  }

  static closed(): Error {
    return new BridgeError('Bridge has been closed')
  }

  static notStarted(): Error {
    return new BridgeError('Bridge connection has not been started')
  }

  static remoteError(
    name = 'BridgeError',
    message = 'An unknown error has occurred',
  ): Error {
    const error = new BridgeError(message)
    error.name = name
    return error
  }
}
