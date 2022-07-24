import type { DOMWindow } from 'jsdom'
import { JSDOM } from 'jsdom'

function patchMessageListener(target: DOMWindow, origin: string) {
  target.addEventListener('message', (event: MessageEvent) => {
    if (event.origin === '') {
      event.stopImmediatePropagation()
      const eventWithOrigin: MessageEvent = new target.MessageEvent('message', {
        data: event.data,
        origin,
      })

      target.dispatchEvent(eventWithOrigin)
    }
  })
}

export function makeWindows(
  parentOrigin: string,
  childOrigin: string,
): readonly [Window, Window] {
  const { window: parentWindow } = new JSDOM('', { url: parentOrigin })
  const { window: childWindow } = new JSDOM('', { url: childOrigin })

  patchMessageListener(parentWindow, childOrigin)
  patchMessageListener(childWindow, parentOrigin)

  return [parentWindow as any, childWindow as any]
}
