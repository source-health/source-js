import { BridgeError } from './BridgeError'
import { Emitter } from './Emitter'
import type { Channel } from './channel/Channel'
import type { Callable, Callback, Unsubscribe } from './common'
import { createUniqueIdFn, LinkStatus } from './common'
import type { EventMessage } from './messages'
import { createEventMessage } from './messages'
import { isResponseMessage } from './messages'
import { createResponseMessage } from './messages'
import { createCallMessage, isCallMessage, isEventMessage, isMessage } from './messages'

export enum BridgeRole {
  Host,
  Guest,
}

export interface BridgeOptions {
  /**
   *
   */
  remote: Window
}

export type BridgeEvents = {
  [x: string]: EventMessage<any>
}

const idFactory = createUniqueIdFn()

export abstract class Bridge<TEvents extends BridgeEvents = BridgeEvents> extends Emitter<TEvents> {
  public abstract role: BridgeRole

  // Current status fo the bridge
  private status: LinkStatus = LinkStatus.Linked

  // Callback to unsubscribe from the channel
  private channelSubscription: Unsubscribe | null = null

  // List of registered listeners
  private listeners: Record<string, Callback<unknown>[]> = {}

  // List of registered listeners
  private pendingCalls: Record<string, [Callback<unknown>, Callback<unknown>]> = {}

  /**
   *
   */
  constructor(
    protected readonly channel: Channel,
    private readonly methods: Record<string, Callable<any[], unknown>> = {},
  ) {
    super()
  }

  /**
   * Initiates a handshake with the remote endpoint
   *
   * This method is undefined on the Bridge class, which is shared between the
   * host and guest. Host and guests individually override this method with their
   * part of the handshake.
   */
  public handshake(): Promise<void> {
    return Promise.reject(new Error('handshake() must be overridden in bridge implementations'))
  }

  /**
   * Initializes the bridge by subscribing to messages
   */
  protected init(): void {
    if (this.channelSubscription) {
      return
    }

    this.channelSubscription = this.channel.listen(this.handleMessage)
  }

  /**
   * Destroys the bridge, including unregistering any listeners on the channel
   *
   * This method must be called to clean up and remove any event listeners that were
   * added.
   */
  public destroy(): void {
    this.channelSubscription?.()
    this.channelSubscription = null
  }

  /**
   * Calls an operation on the other end of the bridge
   *
   * This method will emit a request that calls an operation on the other side of the bridge
   * and awaits its response.
   *
   * @param property the property to call on the remote end of the bridge
   * @param args the arguments to pass to the remote call
   */
  public async call(property: string, args: unknown): Promise<unknown> {
    if (this.status !== LinkStatus.Linked) {
      return Promise.reject(BridgeError.invalidStatus(LinkStatus.Linked, this.status))
    }

    const messageId = idFactory()
    const message = createCallMessage(0, messageId, property, [args])
    const promise = new Promise((resolve, reject) => {
      this.pendingCalls[messageId] = [resolve, reject]
    })

    this.channel.emit(message)

    return promise
  }

  /**
   * Emits an event to the other end of the bridge
   *
   * Emits are fire-and-forget. There is no acknowledgement mechanism. If you want a response, you
   * can use call.
   *
   * @param event the event to fire over the bridge
   * @param args the arguments to pass to the remote call
   */
  public async emitToRemote(event: string, args: unknown): void {
    this.channel.emit(createEventMessage(0, event, args))
  }

  private handleMessage = async (event: MessageEvent) => {
    const { data } = event
    if (!isMessage(data)) {
      return
    }

    if (isCallMessage(data)) {
      const method = this.methods[data.methodName]
      if (!method) {
        this.channel.emit(
          createResponseMessage(
            data.sessionId,
            data.requestId,
            null,
            `Unknown method: ${data.methodName}`,
          ),
        )

        return
      }

      try {
        const result = await method(...data.args)
        this.channel.emit(createResponseMessage(data.sessionId, data.requestId, result))
      } catch (ex) {
        this.channel.emit(createResponseMessage(data.sessionId, data.requestId, null, ex.message))
      }
    } else if (isResponseMessage(data)) {
      const pendingResponse = this.pendingCalls[data.requestId]

      if (!pendingResponse) {
        return
      }

      const [resolve, reject] = pendingResponse
      if (data.error) {
        reject(new Error(data.error))
      } else {
        resolve(data.result)
      }
    } else if (isEventMessage(data)) {
      this.emit(data.eventName, data as any)
    }
  }
}
