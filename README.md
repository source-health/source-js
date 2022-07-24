# Source.js

This is a module for embedding Source-powered workflows into your patient experience.

## Feaures

- Secure appointment booking, forms, and more, powered by Source
- Able to run on your own domain, in your own website
- Pass events to and from the embedded frame

## Usage

Using Source.js is simple. You simply need to initialize the class with an authentication source, and then begin creating elements.

```
const source = new Source({
  authentication: new StaticAuthentication('your member token')
})

const bookingElement = source.element('booking')
bookingElement.on('booked', (appointment) => {
  console.log('Appointment booked')
})
bookingElement.mount('#container')
```

