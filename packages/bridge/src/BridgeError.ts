import type { LinkStatus } from './common'

export class BridgeError extends Error {
  static invalidStatus(expectedStatus: LinkStatus, actualStatus: LinkStatus): Error {
    return new BridgeError(
      `Bridge in invalid state. Expected ${expectedStatus}, but actual state was ${actualStatus}`,
    )
  }
}
