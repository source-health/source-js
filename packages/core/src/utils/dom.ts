export function selectorToNode(selector: HTMLElement | string): HTMLElement | null {
  if (typeof selector === 'string') {
    return document.querySelector(selector)
  } else {
    return selector
  }
}
