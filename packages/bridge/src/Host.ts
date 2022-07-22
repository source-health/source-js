import { Bridge, BridgeRole } from './Bridge'
import type { Channel } from './channel/Channel'
import { createUniqueIdFn } from './common'
import { createHandshakeRequestMessage, isHandshakeResponseMessage, isMessage } from './messages'

const sessionIdGenerator = createUniqueIdFn()

export class Host extends Bridge {
  public readonly role = BridgeRole.Host

  public handshake(): Promise<void> {
    this.init()

    const sessionId = sessionIdGenerator()

    return new Promise((resolve, reject) => {
      // Emit the handshake request message
      const handshakeInterval = setInterval(() => {
        this.channel.emit(createHandshakeRequestMessage(sessionId))
      }, 100)

      // Start listening for handshake replies
      const unsubscribe = this.channel.listen((event) => {
        if (!isMessage(event.data) || !isHandshakeResponseMessage(event.data)) {
          return
        }

        if (event.data.sessionId !== sessionId) {
          return
        }

        clearInterval(handshakeInterval)
        unsubscribe()
        resolve()
      })
    })
  }

  public static frame(channel: Channel, methods: Record<string, unknown> = {}): Host {
    return new Host(channel, methods)
  }
}
