# JS Bridge

This is a low-level library that facilitaties communication between web workers orwindows using a simple Promise-based API

## Feaures

- 🔁 Parent and child can both expose methods and/or events.
- 🔎 Optional strong typing of method names, arguments, return values, and more.
- 🔗 Support multiple concurrent connectionz.
- 🌱 Zero dependencies - about 8KB before gzip.
- 👐 Open source (MIT)

## Usage

The first step of using the Bridge is to declare a channel that identifies the two parties. This library currently supports `WindowChannel`, which enables communication between two Windows. 

Then, you can initialize the host:

```typescript
import { Bridge, WindowChannel } from '@source-health/js-bridge'

const channel = new WindowChannel({
  localWindow: window,
  remoteWindow: frame.contentWindow,
  expectedOrigin: 'https://my.origin',
})

const host = Bridge.host(channel)

host.connect().then(() => {
  console.log('connected')
})
```

And initialize the guest:

```typescript
import { Bridge, WindowChannel } from '@source-health/js-bridge'

const channel = new WindowChannel({
  localWindow: window,
  remoteWindow: window.parent,
  expectedOrigin: '*',
})

const guest = Bridge.guest(channel)

host.connect().then(() => {
  console.log('connected')
})
```

Once both are intialized, you can start communicating!

## Events

Events are fire-and-forget notifications that can be broadcast from one side of the bridge, and observed from the other.

On the host:

```typescript
bridge.on('someEvent', (data) => console.log(Data))
```

On the guest:

```typescript
bridge.broadcast('someEvent', { key: 'value' })
```

Note that events can be broadcast from either side. Guests can receive events from the host, and host can receive events from the guest. There is no notification of an event being received. The protocol only emits the event.

## Methods

Methods are bidirectional request/response call pairs. Calling methods can accept arguments and return values. All calls are asynchronous at the protocol layer.

On the host:

```typescript
const bridge = Bridge.host(channel, {
  methods: {
    token: () => 'VerySecureValue'
  }
})
```

On the guest:

```typescript
const guest = Bridge.guest(channel)
const token = await guest.call('token')

// VerySecureValue
```

Methods have a default timeout of 5s (5000ms), which can be configured when instantiating the Bridge.