import type { IdType, KeyType } from './common'
import { MARKER } from './common'

export enum MessageType {
  HandshakeRequest = 'handshake-request',
  HandshakeResponse = 'handshake-response',
  HandshakeAck = 'handshake-ack',
  Call = 'call',
  Response = 'response',
  Error = 'error',
  Event = 'event',
}

export interface Message<T extends MessageType> {
  type: typeof MARKER
  action: T
  sessionId: IdType
}

export type HandshakeRequestMessage = Message<MessageType.HandshakeRequest>

export type HandshakeResponseMessage = Message<MessageType.HandshakeResponse>

export type HandshakeAckMessage = Message<MessageType.HandshakeAck>

export interface CallMessage<A extends Array<any> = []>
  extends Message<MessageType.Call> {
  requestId: IdType
  methodName: KeyType
  args: A
}

export interface ResponseMessage<R> extends Message<MessageType.Response> {
  requestId: IdType
  result?: R
  error?: any
}

export interface EventMessage<P> extends Message<MessageType.Event> {
  eventName: KeyType
  payload: P
}

// Message Creators

export function createHandshakeRequestMessage(
  sessionId: IdType,
): HandshakeRequestMessage {
  return {
    type: MARKER,
    action: MessageType.HandshakeRequest,
    sessionId,
  }
}

export function createHandshakeResponseMessage(
  sessionId: IdType,
): HandshakeResponseMessage {
  return {
    type: MARKER,
    action: MessageType.HandshakeResponse,
    sessionId,
  }
}

export function createHandshakeAckMessage(
  sessionId: IdType,
): HandshakeAckMessage {
  return {
    type: MARKER,
    action: MessageType.HandshakeAck,
    sessionId,
  }
}

export function createCallMessage<A extends Array<any>>(
  sessionId: IdType,
  requestId: IdType,
  methodName: KeyType,
  args: A,
): CallMessage<A> {
  return {
    type: MARKER,
    action: MessageType.Call,
    sessionId,
    requestId,
    methodName,
    args,
  }
}

export function createResponseMessage<R>(
  sessionId: IdType,
  requestId: IdType,
  result: R,
  error?: string,
): ResponseMessage<R> {
  const message: ResponseMessage<R> = {
    type: MARKER,
    action: MessageType.Response,
    sessionId,
    requestId,
  }

  if (result !== undefined) {
    message.result = result
  }

  if (error !== undefined) {
    message.error = error
  }

  return message
}

export function createEventMessage<P>(
  sessionId: IdType,
  eventName: KeyType,
  payload: P,
): EventMessage<P> {
  return {
    type: MARKER,
    action: MessageType.Event,
    sessionId,
    eventName,
    payload,
  }
}

// Type Guards

export function isMessage(m: any): m is Message<any> {
  return m && m.type === MARKER
}

export function isHandshakeRequestMessage(
  m: Message<any>,
): m is HandshakeRequestMessage {
  return isMessage(m) && m.action === MessageType.HandshakeRequest
}

export function isHandshakeResponseMessage(
  m: Message<any>,
): m is HandshakeResponseMessage {
  return isMessage(m) && m.action === MessageType.HandshakeResponse
}

export function isHandshakeAckMessage(
  m: Message<any>,
): m is HandshakeAckMessage {
  return isMessage(m) && m.action === MessageType.HandshakeAck
}

export function isCallMessage(m: Message<any>): m is CallMessage<any[]> {
  return isMessage(m) && m.action === MessageType.Call
}

export function isResponseMessage(m: Message<any>): m is ResponseMessage<any> {
  return isMessage(m) && m.action === MessageType.Response
}

export function isEventMessage(m: Message<any>): m is EventMessage<any> {
  return isMessage(m) && m.action === MessageType.Event
}
