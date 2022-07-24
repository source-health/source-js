import { WindowChannel } from '../WindowChannel'

describe('WindowChannel', () => {
  it('should post message on remote window', async () => {
    const proxyLocalWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
    }

    const proxyRemoteWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
    }

    const expectedOrigin = 'https://child.example.org'
    const channel = new WindowChannel({
      localWindow: proxyLocalWindow as any,
      remoteWindow: proxyRemoteWindow as any,
      expectedOrigin,
      disableSourceCheck: true,
    })

    const testMessage = {
      key: 'value',
    }

    channel.postMessage(testMessage)
    expect(proxyRemoteWindow.postMessage).toHaveBeenCalledWith(
      testMessage,
      expectedOrigin,
    )
  })

  it('should register event listeners on remote window', async () => {
    const proxyLocalWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
    }

    const proxyRemoteWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
    }

    const expectedOrigin = 'https://child.example.org'
    const channel = new WindowChannel({
      localWindow: proxyLocalWindow as any,
      remoteWindow: proxyRemoteWindow as any,
      expectedOrigin,
      disableSourceCheck: true,
    })

    const subscriber = channel.addMessageListener(() => void 0)
    expect(proxyLocalWindow.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.anything(),
    )

    subscriber()
    expect(proxyLocalWindow.removeEventListener).toHaveBeenCalledWith(
      'message',
      proxyLocalWindow.addEventListener.mock.lastCall[1],
    )
  })

  it('should validate events before forwarding', async () => {
    const proxyLocalWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
    }

    const proxyRemoteWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
    }

    const expectedOrigin = 'https://child.example.org'
    const channel = new WindowChannel({
      localWindow: proxyLocalWindow as any,
      remoteWindow: proxyRemoteWindow as any,
      expectedOrigin,
    })

    const registeredCallback = jest.fn()
    const subscriber = channel.addMessageListener(registeredCallback)
    const callback = proxyLocalWindow.addEventListener.mock.lastCall[1]

    // Pass a sample message event with a valid payload, and expect it to be called
    callback({
      origin: expectedOrigin,
      source: proxyRemoteWindow,
      data: {
        some: 'value',
      },
    })

    expect(registeredCallback).toHaveBeenCalledTimes(1)

    // Now pass a bad origin and we should not forward it
    callback({
      origin: 'https://google.com',
      source: proxyRemoteWindow,
      data: {
        some: 'value',
      },
    })

    expect(registeredCallback).toHaveBeenCalledTimes(1)

    // And pass a bad window, it should also not be called
    callback({
      origin: 'https://google.com',
      source: proxyLocalWindow,
      data: {
        some: 'value',
      },
    })

    expect(registeredCallback).toHaveBeenCalledTimes(1)
    subscriber()
  })
})
