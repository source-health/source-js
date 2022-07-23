import { BridgeError } from './BridgeError'
import { Dispatcher } from './Dispatcher'
import type { Cancelable } from './cancelable'
import { createCancelToken } from './cancelable'
import type { Channel } from './channel/Channel'
import { BridgeStatus } from './common'
import type { EventsType, IdType, MethodsType, PromisePair } from './common'
import { BaseEmitter } from './emitter/BaseEmitter'
import type {
  CallMessage,
  EventMessage,
  HandshakeAckMessage,
  HandshakeRequestMessage,
  HandshakeResponseMessage,
  ResponseMessage,
} from './messages'
import { MessageType } from './messages'
import { wrappedInvoke } from './utils'

export enum BridgeRole {
  Host = 'host',
  Guest = 'guest',
}

export interface BridgeOptions<LM extends MethodsType> {
  /**
   * Local methods to expose to the remote endpoint
   */
  methods?: LM

  /**
   * Default timeout to apply to calls (in millis)
   */
  callTimeout?: number
}

export class Bridge<
  LE extends EventsType = EventsType,
  LM extends MethodsType = MethodsType,
  RE extends EventsType = EventsType,
  RM extends MethodsType = MethodsType,
> extends BaseEmitter<RE> {
  private readonly pendingCalls: Record<IdType, PromisePair> = {}
  private readonly dispatcher: Dispatcher
  private readonly methods: LM | undefined
  private readonly callTimeout: number

  private currentSessionId = 0
  private connectionPromise: Promise<void> | null = null
  private closeCancelation: Cancelable | null = null
  private status: BridgeStatus = BridgeStatus.Idle

  constructor(
    private readonly role: BridgeRole,
    channel: Channel,
    options?: Partial<BridgeOptions<LM>>,
  ) {
    super()

    this.methods = options?.methods
    this.callTimeout = options?.callTimeout ?? 5000
    this.dispatcher = new Dispatcher(channel)
    this.dispatcher.on(
      MessageType.HandshakeRequest,
      this.handleHandshakeRequest.bind(this),
    )
    this.dispatcher.on(
      MessageType.HandshakeResponse,
      this.handleHandshakeResponse.bind(this),
    )
    this.dispatcher.on(
      MessageType.HandshakeAck,
      this.handleHandshakeAck.bind(this),
    )
    this.dispatcher.on(MessageType.Call, this.handleCall.bind(this))
    this.dispatcher.on(MessageType.Response, this.handleResponse.bind(this))
    this.dispatcher.on(MessageType.Event, this.handleEvent.bind(this))
  }

  /**
   * Initiates a connection to the other party, and returns a promise
   *
   * Connect must be called on both sides to intiate the connection process. It is strongly
   * advised to place the host into a connecting status before beginning the guest handshake,
   * however the guest will attempt to handshake multiple times before timing out so it is not
   * strictly necessary.
   *
   * @returns a promise that will resolve when the connection completes
   */
  public connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    const cancelationToken = createCancelToken()
    const connectionPromise = new Promise<void>((resolve) => {
      const cleanup = () => {
        this.off('connected', wrappedResolve)
        cancelUnsubscribe()
      }

      const wrappedResolve = wrappedInvoke(resolve, cleanup)
      const cancelUnsubscribe = cancelationToken.onCancel(() => {
        wrappedResolve()
      })

      this.on('connected', wrappedResolve)
    })

    this.connectionPromise = connectionPromise
    this.closeCancelation = cancelationToken
    this.dispatcher.open()
    this.updateStatus(BridgeStatus.Connecting)

    if (this.role === BridgeRole.Guest) {
      this.dispatcher.handshakeRequest(++this.currentSessionId)
    }

    return connectionPromise
  }

  /**
   * Closes the active link to the communication channel. Once called, the bridge will be
   * placed back in an idle status.
   *
   * You may reinitiate connection by calling .connect() once again after .close() has been called.
   * Note that the host *must* be in an open status in order for this connection reattempt to work.
   */
  public close(): void {
    this.connectionPromise = null
    this.closeCancelation?.cancel()

    this.dispatcher.close()
    this.updateStatus(BridgeStatus.Idle)
  }

  /**
   * Invokes a remote method with a given list of arugments, returning a promise for its response
   *
   * @param method ths remote method to execute
   * @param args the arguments to provide on the remote method
   * @returns a promise for the result of the remote method
   */
  public call<K extends keyof RM>(
    method: K,
    ...args: Parameters<RM[K]>
  ): Promise<ReturnType<RM[K]>> {
    const callTimeout = this.callTimeout
    const requestId = this.dispatcher.callOnRemote(
      this.currentSessionId,
      method as string,
      args,
    )

    const callPromise = new Promise<ReturnType<RM[K]>>((resolve, reject) => {
      let timeoutInterval: any = null

      if (callTimeout > 0) {
        timeoutInterval = setTimeout(() => {
          reject(BridgeError.callTimeout(method as string, callTimeout))
          delete this.pendingCalls[requestId]
        }, callTimeout)

        const clearTimer = () => {
          clearInterval(timeoutInterval)
        }

        this.pendingCalls[requestId] = [
          wrappedInvoke(resolve, clearTimer),
          wrappedInvoke(reject, clearTimer),
        ]
      } else {
        this.pendingCalls[requestId] = [resolve, reject]
      }
    })

    return callPromise
  }

  /**
   * Broadcasts an event to the remote party
   *
   * @param eventName the event to broadcast to the remote
   * @param payload the contents to include in the event
   */
  public broadcast<K extends keyof LE>(eventName: K, payload: LE[K]): void {
    this.dispatcher.emitToRemote(
      this.currentSessionId,
      eventName as string,
      payload,
    )
  }

  /**
   * Returns the current status of the brodge
   */
  public get connected(): boolean {
    return this.status === BridgeStatus.Connected
  }

  /**
   * @internal
   */
  private updateStatus(status: BridgeStatus) {
    this.status = status

    if (this.status === BridgeStatus.Connected) {
      this.emit('connected')
    }
  }

  /**
   * @internal
   */
  private handleHandshakeRequest(message: HandshakeRequestMessage) {
    if (this.role !== BridgeRole.Host) {
      return
    }

    console.log('got handshake request', message.sessionId)
    this.dispatcher.handshakeResponse(message.sessionId)
    this.updateStatus(BridgeStatus.Connecting)
  }

  /**
   * @internal
   */
  private handleHandshakeAck(message: HandshakeAckMessage) {
    if (this.role !== BridgeRole.Host) {
      return
    }

    this.currentSessionId = message.sessionId
    this.updateStatus(BridgeStatus.Connected)
  }

  /**
   * @internal
   */
  private handleHandshakeResponse(message: HandshakeResponseMessage) {
    if (
      this.role !== BridgeRole.Guest ||
      message.sessionId !== this.currentSessionId
    ) {
      console.log('not acking')
      return
    }

    this.updateStatus(BridgeStatus.Connected)
    this.dispatcher.handshakeAck(message.sessionId)
  }

  /**
   * @internal
   */
  private handleResponse(message: ResponseMessage<any>) {
    if (
      !this.pendingCalls[message.requestId] ||
      message.sessionId !== this.currentSessionId
    ) {
      return
    }

    const [resolve, reject] = this.pendingCalls[message.requestId]
    delete this.pendingCalls[message.requestId]

    if (message.error) {
      reject(message.error)
    } else {
      resolve(message.result)
    }
  }

  /**
   * @internal
   */
  private handleCall(message: CallMessage<any>) {
    if (message.sessionId !== this.currentSessionId) {
      return
    }

    const method = this.methods?.[message.methodName]
    if (!method || typeof method !== 'function') {
      this.dispatcher.respondToRemote(
        this.currentSessionId,
        message.requestId,
        null,
        BridgeError.unknownMethod(message.methodName),
      )

      return
    }

    // Invoke the method, which we should wrap in a promise
    Promise.resolve(method(...message.args)).then(
      (result: unknown) =>
        this.dispatcher.respondToRemote(
          this.currentSessionId,
          message.requestId,
          result,
          undefined,
        ),
      (error: unknown) =>
        this.dispatcher.respondToRemote(
          this.currentSessionId,
          message.requestId,
          undefined,
          error,
        ),
    )
  }

  /**
   * @internal
   */
  private handleEvent(message: EventMessage<any>) {
    if (message.sessionId !== this.currentSessionId) {
      return
    }

    this.emit(message.eventName, message.payload)
  }

  /**
   * Creates a new Bridge on the host side
   *
   * The bridge host is the containing application. There is no difference in the capabilities
   * of the host or guest, the role simply defines who should initiate the handshake.
   *
   * @param channel the channel over which to communicate
   * @param options the methods to expose to the guest
   * @returns a new bridge instance
   */
  public static host<
    RE extends EventsType,
    RM extends MethodsType,
    LE extends EventsType,
    LM extends MethodsType,
  >(channel: Channel, options?: BridgeOptions<LM>): Bridge<LE, LM, RE, RM> {
    return new Bridge(BridgeRole.Host, channel, options)
  }

  /**
   * Creates a new Bridge on the guest side
   *
   * The bridge guest is the contained application. There is no difference in the capabilities
   * of the host or guest, the role simply defines who should initiate the handshake.
   *
   * @param channel the channel over which to communicate
   * @param options the methods to expose to the host
   * @returns a new bridge instance
   */
  public static guest<
    RE extends EventsType,
    RM extends MethodsType,
    LE extends EventsType,
    LM extends MethodsType,
  >(channel: Channel, options?: BridgeOptions<LM>): Bridge<LE, LM, RE, RM> {
    return new Bridge(BridgeRole.Guest, channel, options)
  }
}
