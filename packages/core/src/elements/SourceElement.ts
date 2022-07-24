import { Bridge, DebugChannel, WindowChannel } from '@source-health/js-bridge'

import type {
  SourceConfiguration,
  SourceConfigurationOptions,
} from '../SourceConfiguration'
import { createConnectEndpoint } from '../endpoints'
import { selectorToNode } from '../utils/dom'
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
  /* @internal source instance to which we are attached */
  private readonly source: SourceConfiguration

  /* @internal static configuration for the element */
  private readonly configuration: ElementConfiguration

  /* @internal last known options for the element */
  private options: TOptions

  /* @internal current status of the element */
  private status: MountStatus = MountStatus.Unmounted

  /* @internal guest iframe element */
  private frameEl: HTMLIFrameElement | null = null

  /* @internal bridge instance */
  private bridge: Bridge | null = null

  /**
   * Create a new Element instance
   *
   * @param source the parent source instance
   * @param configuration
   * @param options
   */
  constructor(
    source: SourceConfiguration,
    options: TOptions,
    configuration: ElementConfiguration,
  ) {
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

    // Update the mount status
    const url = this.createUrl()
    const frame = this.createFrame(url)
    this.status = MountStatus.Mounting
    this.frameEl = frame

    // Append the frame to our container
    node.appendChild(frame)

    // Ensure we have a content window
    const contentWindow = frame.contentWindow
    if (!contentWindow) {
      throw new Error(
        'Expected contentWindow to be available after mounting element',
      )
    }

    // Create the communication channel
    const channel = new DebugChannel(
      new WindowChannel({
        localWindow: this.configuration.window,
        remoteWindow: contentWindow,
        expectedOrigin: url.origin,
      }),
    )

    // Now that the frame is appended to the DOM, we can create out bridge and initiate our
    // handshake process
    this.bridge = Bridge.host(channel, {
      methods: {
        appearance: () => this.source.getAppearance(),
        token: () => this.source.getToken(),
        options: () => this.options,
        updateFrameStyle: (dimensions: Partial<DOMRect>) => {
          if (dimensions.height) {
            frame.style.height = `${dimensions.height}px`
          }
        },
      },
    })

    this.bridge.connect()
    this.bridge.on('connected', () => {
      this.status = MountStatus.Mounted
    })

    this.source.on('updated', this.handleSourceUpdate)
  }

  /**
   * Unmounts the element from the DOM. This is a noop if the element is not mounted.
   */
  public unmount(): void {
    if (this.status === MountStatus.Unmounted) {
      return
    }

    // Remove the frame from its parent
    this.bridge?.close()
    this.frameEl?.parentNode?.removeChild(this.frameEl)
    this.frameEl = null
    this.status = MountStatus.Unmounted
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
    this.bridge?.broadcast('updatedOptions', options)
  }

  /**
   * Registers an event listener to reply to events coming from the element
   *
   * @param event the event to subscribe to
   * @param handler callback function to be invoked when the event is triggered
   * @returns the element instance, for chaining
   */
  public on<K extends keyof TEvents>(
    event: K & string,
    handler: Listener<TEvents[K]>,
  ): void {
    this.bridge?.on(event, handler)
  }

  /**
   * Deregisters an event listener for events coming from the element
   *
   * @param event the event to unsubscribe from
   * @param handler callback function to be invoked when the event is triggered
   * @returns the element instance, for chaining
   */
  public off<K extends keyof TEvents>(
    event: K & string,
    handler: Listener<TEvents[K]>,
  ): void {
    this.bridge?.off(event, handler)
  }

  /* @internal */
  private createFrame(url: URL): HTMLIFrameElement {
    const frame = document.createElement('iframe')
    frame.setAttribute('src', url.toString())
    frame.setAttribute('scrolling', 'no')
    frame.setAttribute(
      'style',
      [
        'height: 40px',
        'overflow: hidden',
        'transition: height 0.35s ease 0s, opacity 0.4s ease 0.1s',
        'border: none !important',
        'padding: 0px !important',
        'user-select: none !important',
        'overflow: hidden !important',
        'width: 100% !important',
      ].join('; '),
    )

    return frame
  }

  private createUrl(): URL {
    const url = createConnectEndpoint(
      this.source.getDomain(),
      this.configuration.path,
    )
    url.searchParams.append('mode', 'embed')
    return url
  }

  private handleSourceUpdate = (
    config: Pick<SourceConfigurationOptions, 'appearance'>,
  ) => {
    this.bridge?.broadcast('updatedConfig', {
      appearance: config.appearance,
    })
  }
}
