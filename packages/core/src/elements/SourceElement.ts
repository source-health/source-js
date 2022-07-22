import { Host, FrameChannel } from '@source-health/js-bridge'

import type { Source } from '../Source'
import { createConnectEndpoint } from '../endpoints'
import { selectorToNode } from '../utils/dom'
import { generateId } from '../utils/random'
import type { BaseElementEvents, Listener } from '../utils/types'

enum MountStatus {
  Unmounted,
  Mounting,
  Mounted,
}

export interface ElementConfiguration {
  /**
   * Target path to load in the connect application
   */
  path: string

  /**
   * The name of this element
   */
  element: string

  /**
   * Override the window to which the message handlers should be attached
   */
  window?: Window
}

export class SourceElement<
  TOptions = unknown,
  TEvents extends BaseElementEvents = BaseElementEvents,
> {
  /**
   * Unique identifier for this element instance
   */
  private readonly identifier: string

  /**
   * Source instance on which this element is bound
   */
  private readonly source: Source

  /**
   * Configuration for the particular element
   */
  private readonly configuration: ElementConfiguration

  /**
   * Listeners that are mounted to this element
   */
  private readonly listeners: Record<string, Listener<any>[]> = {}

  /**
   * Latest updated options for the element
   */
  private options: TOptions

  /**
   * Mount status for the element
   */
  private status: MountStatus = MountStatus.Unmounted

  /**
   * Pointer to the frame element
   */
  private frameEl: HTMLIFrameElement | null = null

  //
  private bridge: Host | null = null

  /**
   * Create a new Element instance
   *
   * @param source the parent source instance
   * @param configuration
   * @param options
   */
  constructor(source: Source, options: TOptions, configuration: ElementConfiguration) {
    this.identifier = generateId(32)
    this.source = source
    this.configuration = configuration
    this.options = options
  }

  /**
   * Mount the element to a target node
   *
   * Once invoked, the element will be bound to the target container, a frame will be created,
   * and a handshake setup.
   *
   * @param container the container node which should contain the element frame
   */
  public mount(container: HTMLElement | string): void {
    if (this.status !== MountStatus.Unmounted) {
      throw new Error('Element is already mounted')
    }

    const node = selectorToNode(container)
    if (!node) {
      throw new Error(`Selector ${container} did not resolve to any node`)
    }

    // Register message listeners
    window.addEventListener('message', this.handleMessageEvent)

    // Update the mount status
    const frame = this.createFrame()
    this.status = MountStatus.Mounting
    this.frameEl = frame
    this.frameEl.setAttribute('scrolling', 'no')
    this.frameEl.style.overflow = 'hidden'

    // Append the frame to our container
    node.appendChild(frame)

    // Now that the frame is appended to the DOM, we can create out bridge and initiate our
    // handshake process
    this.bridge = Host.frame(new FrameChannel(window, frame.contentWindow!), {
      updateFrameStyle: (args: number) => {
        frame.style.height = `${args}px`
      },
    })

    this.bridge.handshake()
  }

  /**
   * Unmounts the element from the DOM. This is a noop if the element is not mounted.
   */
  public unmount(): void {
    if (this.status === MountStatus.Unmounted) {
      return
    }

    // Remove the frame from its parent
    this.bridge?.destroy()
    this.frameEl?.parentNode?.removeChild(this.frameEl)
    this.frameEl = null
    this.status = MountStatus.Unmounted

    // Remove event listeners that are no longer needed
    window.removeEventListener('message', this.handleMessageEvent)
  }

  /**
   * Update the options associated with an existing element
   *
   * If the element is mounted, this method will also push the updated options into the mounted
   * frame and update the target embedded page
   *
   * @param options the new options to set in the frame
   */
  public update(options: TOptions): void {
    this.options = options
  }

  /**
   * Registers an event listener to reply to events coming from the element
   *
   * @param event the event to subscribe to
   * @param handler callback function to be invoked when the event is triggered
   * @returns the element instance, for chaining
   */
  public on<K extends keyof TEvents>(event: K & string, handler: Listener<TEvents[K]>): this {
    this.bridge?.on(event, handler)
  }

  /**
   * Deregisters an event listener for events coming from the element
   *
   * @param event the event to unsubscribe from
   * @param handler callback function to be invoked when the event is triggered
   * @returns the element instance, for chaining
   */
  public off<K extends keyof TEvents>(event: K & string, handler: Listener<TEvents[K]>): this {
    this.bridge?.off(event, handler)
  }

  private createFrame(): HTMLIFrameElement {
    const url = createConnectEndpoint(this.source.getEnvironment(), this.configuration.path)
    url.searchParams.append('mode', 'embed')

    const frame = document.createElement('iframe')
    frame.setAttribute('src', url.toString())
    return frame
  }

  //
  // Event Handlers
  //

  private handleMessageEvent = async (event: MessageEvent) => {}
}
