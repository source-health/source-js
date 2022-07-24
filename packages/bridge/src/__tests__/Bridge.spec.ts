import { Bridge } from '../Bridge'
import { WindowChannel } from '../channel/WindowChannel'
import { makeWindows } from '../testUtils'

describe('Bridge', () => {
  it('should successfully handshake', async () => {
    const [hostWindow, guestWindow] = makeWindows(
      'https://host.example.org',
      'https://guest.example.org',
    )

    const [host, guest] = [
      Bridge.host(
        new WindowChannel({
          localWindow: hostWindow,
          remoteWindow: guestWindow,
          expectedOrigin: 'https://guest.example.org',
          disableSourceCheck: true,
        }),
      ),
      Bridge.guest(
        new WindowChannel({
          localWindow: guestWindow,
          remoteWindow: hostWindow,
          disableSourceCheck: true,
        }),
      ),
    ]

    await Promise.all([host.connect(), guest.connect()])

    expect(host.connected).toBeTruthy()
    expect(guest.connected).toBeTruthy()
  })

  it('should emit events', async () => {
    const [hostWindow, guestWindow] = makeWindows(
      'https://host.example.org',
      'https://guest.example.org',
    )

    const [host, guest] = [
      Bridge.host(
        new WindowChannel({
          localWindow: hostWindow,
          remoteWindow: guestWindow,
          expectedOrigin: 'https://guest.example.org',
          disableSourceCheck: true,
        }),
      ),
      Bridge.guest(
        new WindowChannel({
          localWindow: guestWindow,
          remoteWindow: hostWindow,
          disableSourceCheck: true,
        }),
      ),
    ]

    await Promise.all([host.connect(), guest.connect()])

    const eventPromise = host.once('someEvent')

    guest.broadcast('someEvent', {
      some: 'data',
    })

    expect(eventPromise).resolves.toEqual({
      some: 'data',
    })
  })

  it('should resolve promises for successful method calls', async () => {
    const [hostWindow, guestWindow] = makeWindows(
      'https://host.example.org',
      'https://guest.example.org',
    )

    const [host, guest] = [
      Bridge.host(
        new WindowChannel({
          localWindow: hostWindow,
          remoteWindow: guestWindow,
          expectedOrigin: 'https://guest.example.org',
          disableSourceCheck: true,
        }),
      ),
      Bridge.guest(
        new WindowChannel({
          localWindow: guestWindow,
          remoteWindow: hostWindow,
          disableSourceCheck: true,
        }),
        {
          methods: {
            customCall: (arg) =>
              Promise.resolve({
                providedArg: arg,
              }),
          },
        },
      ),
    ]

    await Promise.all([host.connect(), guest.connect()])

    const responsePromise = host.call('customCall', { my: 'arguments' })

    await expect(responsePromise).resolves.toEqual({
      providedArg: {
        my: 'arguments',
      },
    })
  })

  it('should reject promises for failed method calls', async () => {
    const [hostWindow, guestWindow] = makeWindows(
      'https://host.example.org',
      'https://guest.example.org',
    )

    const [host, guest] = [
      Bridge.host(
        new WindowChannel({
          localWindow: hostWindow,
          remoteWindow: guestWindow,
          expectedOrigin: 'https://guest.example.org',
          disableSourceCheck: true,
        }),
      ),
      Bridge.guest(
        new WindowChannel({
          localWindow: guestWindow,
          remoteWindow: hostWindow,
          disableSourceCheck: true,
        }),
        {
          methods: {
            customCall: () => Promise.reject(new Error('Something went wrong')),
          },
        },
      ),
    ]

    await Promise.all([host.connect(), guest.connect()])

    const responsePromise = host.call('customCall', { my: 'arguments' })

    await expect(responsePromise).rejects.toThrowError('Something went wrong')
  })
})
