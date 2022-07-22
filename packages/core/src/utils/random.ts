function dec2hex(dec: number): string {
  return dec.toString(16).padStart(2, '0')
}

export function generateId(len: number): string {
  const bytes = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes, dec2hex).join('')
}
