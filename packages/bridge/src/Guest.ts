import { Bridge, BridgeRole } from './Bridge'
import { FrameChannel } from './channel/FrameChannel'
import { createHandshakeResponseMessage, isHandshakeRequestMessage, isMessage } from './messages'

export class Guest extends Bridge {
  public readonly role = BridgeRole.Guest

  public async handshake(): Promise<void> {
    this.init()

    return new Promise((resolve) => {
      const unsubscribe = this.channel.listen((event) => {
        if (!isMessage(event.data) || !isHandshakeRequestMessage(event.data)) {
          return
        }

        this.channel.emit(createHandshakeResponseMessage(event.data.sessionId))
        resolve()
        unsubscribe()
      })
    })
  }

  public static frame(): Guest {
    return new Guest(
      new FrameChannel(window, window.parent, {
        expectedOrigin: '*',
      }),
    )
  }
}
