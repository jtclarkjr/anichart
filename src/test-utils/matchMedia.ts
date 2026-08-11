import { vi } from 'vitest'

class TestMediaQueryListEvent extends Event implements MediaQueryListEvent {
  readonly matches: boolean
  readonly media: string

  constructor(matches: boolean, media: string) {
    super('change')
    this.matches = matches
    this.media = media
  }
}

export const createMediaQueryController = (media: string, initialMatches: boolean) => {
  let matches = initialMatches
  let mediaQuery: MediaQueryList
  const listeners = new Set<EventListenerOrEventListenerObject>()
  const legacyListeners = new Set<(this: MediaQueryList, event: MediaQueryListEvent) => unknown>()

  const value = {
    get matches() {
      return matches
    },
    media,
    onchange: null,
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
      if (type === 'change' && listener) listeners.add(listener)
    },
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
      if (type === 'change' && listener) listeners.delete(listener)
    },
    addListener(listener) {
      if (listener) legacyListeners.add(listener)
    },
    removeListener(listener) {
      if (listener) legacyListeners.delete(listener)
    },
    dispatchEvent(event) {
      listeners.forEach((listener) => {
        if (typeof listener === 'function') listener.call(mediaQuery, event)
        else listener.handleEvent(event)
      })

      if (event instanceof TestMediaQueryListEvent) {
        legacyListeners.forEach((listener) => listener.call(mediaQuery, event))
        mediaQuery.onchange?.call(mediaQuery, event)
      }

      return !event.defaultPrevented
    }
  } satisfies MediaQueryList

  mediaQuery = value
  const addEventListener = vi.spyOn(value, 'addEventListener')
  const removeEventListener = vi.spyOn(value, 'removeEventListener')

  return {
    mediaQuery,
    addEventListener,
    removeEventListener,
    setMatches(nextMatches: boolean) {
      matches = nextMatches
      mediaQuery.dispatchEvent(new TestMediaQueryListEvent(matches, media))
    }
  }
}

export type MediaQueryController = ReturnType<typeof createMediaQueryController>

export const installMatchMedia = (controller: MediaQueryController): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => controller.mediaQuery)
  )
}
