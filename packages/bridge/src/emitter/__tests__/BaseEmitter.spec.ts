import { BaseEmitter } from '../BaseEmitter'

describe('BaseEmitter', () => {
  function emit(emitter: BaseEmitter, eventName: string, data: unknown) {
    const castEmitter = emitter as any
    castEmitter.emit(eventName, data)
  }

  it('should register listeners', () => {
    const emitter = new BaseEmitter()
    const callback = jest.fn()
    const sampleEventData = { key: 'value' }
    emitter.on('data', callback)

    emit(emitter, 'data', sampleEventData)
    expect(callback).toHaveBeenCalledWith(sampleEventData)
  })

  it('should stop notifying deregistered listeners', () => {
    const emitter = new BaseEmitter()
    const callback = jest.fn()
    const sampleEventData = { key: 'value' }
    emitter.on('data', callback)
    emitter.off('data', callback)

    emit(emitter, 'data', sampleEventData)
    expect(callback).not.toHaveBeenCalledWith(sampleEventData)
  })

  it('should trigger a single listener', () => {
    const emitter = new BaseEmitter()
    const sampleEventData = { key: 'value' }
    const promise = emitter.once('data')

    emit(emitter, 'data', sampleEventData)
    expect(promise).resolves.toBe(sampleEventData)
  })
})
