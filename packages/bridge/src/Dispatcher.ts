import type { Channel } from './channel/Channel'
import type { IdType, KeyType, Unsubscribe } from './common'
import { createUniqueIdFn } from './common'
import { BaseEmitter } from './emitter/BaseEmitter'
import type {
  CallMessage,
  EventMessage,
  HandshakeAckMessage,
  HandshakeRequestMessage,
  HandshakeResponseMessage,
  ResponseMessage,
} from './messages'
import { isHandshakeAckMessage } from './messages'
import { createHandshakeAckMessage } from './messages'
import {
  isHandshakeRequestMessage,
  isHandshakeResponseMessage,
} from './messages'
import {
  createHandshakeRequestMessage,
  createHandshakeResponseMessage,
} from './messages'
import {
  createCallMessage,
  createEventMessage,
  createResponseMessage,
  isCallMessage,
  isEventMessage,
  isMessage,
  isResponseMessage,
  MessageType,
} from './messages'

export type DispatcherEvents = {
  [x: string]:
    | CallMessage<any>
    | EventMessage<any>
    | ResponseMessage<any>
    | HandshakeRequestMessage
    | HandshakeResponseMessage
    | HandshakeAckMessage
  [MessageType.Call]: CallMessage<any>
  [MessageType.Event]: EventMessage<any>
  [MessageType.Response]: ResponseMessage<any>
  [MessageType.HandshakeRequest]: HandshakeRequestMessage
  [MessageType.HandshakeResponse]: HandshakeResponseMessage
  [MessageType.HandshakeAck]: HandshakeAckMessage
}

export class Dispatcher extends BaseEmitter<DispatcherEvents> {
  private readonly uniqueId: () => IdType
  private removeMessageListener: Unsubscribe | null = null

  constructor(private readonly channel: Channel) {
    super()

    this.uniqueId = createUniqueIdFn()
  }

  public open(): void {
    if (this.removeMessageListener) {
      return
    }

    this.removeMessageListener = this.channel.addMessageListener(
      this.messengerListener.bind(this),
    )
  }

  public handshakeRequest(sessionId: IdType): void {
    this.channel.postMessage(createHandshakeRequestMessage(sessionId))
  }

  public handshakeResponse(sessionId: IdType): void {
    this.channel.postMessage(createHandshakeResponseMessage(sessionId))
  }

  public handshakeAck(sessionId: IdType): void {
    this.channel.postMessage(createHandshakeAckMessage(sessionId))
  }

  public callOnRemote(
    sessionId: IdType,
    methodName: KeyType,
    args: any[],
  ): IdType {
    const requestId = this.uniqueId()
    const message = createCallMessage(sessionId, requestId, methodName, args)
    this.channel.postMessage(message)
    return requestId
  }

  public respondToRemote(
    sessionId: IdType,
    requestId: IdType,
    value: any,
    error: any,
  ) {
    if (error instanceof Error) {
      error = {
        name: error.name,
        message: error.message,
      }
    }
    const message = createResponseMessage(sessionId, requestId, value, error)
    this.channel.postMessage(message)
  }

  emitToRemote(sessionId: IdType, eventName: KeyType, payload: any) {
    const message = createEventMessage(sessionId, eventName, payload)
    this.channel.postMessage(message)
  }

  public close(): void {
    this.removeMessageListener?.()
    this.removeAllListeners()

    this.removeMessageListener = null
  }

  private messengerListener(event: MessageEvent) {
    const { data } = event

    if (!isMessage(data)) {
      return
    }

    if (isCallMessage(data)) {
      this.emit(MessageType.Call, data)
    } else if (isResponseMessage(data)) {
      this.emit(MessageType.Response, data)
    } else if (isEventMessage(data)) {
      this.emit(MessageType.Event, data)
    } else if (isHandshakeRequestMessage(data)) {
      this.emit(MessageType.HandshakeRequest, data)
    } else if (isHandshakeResponseMessage(data)) {
      this.emit(MessageType.HandshakeResponse, data)
    } else if (isHandshakeAckMessage(data)) {
      this.emit(MessageType.HandshakeAck, data)
    }
  }
}
