import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInfiniteScroll } from '../useInfiniteScroll'

enableAutoUnmount(afterEach)

class IntersectionObserverMock implements IntersectionObserver {
  static instances: IntersectionObserverMock[] = []

  readonly root = null
  readonly rootMargin: string
  readonly scrollMargin = '0px'
  readonly thresholds: readonly number[]
  readonly observe = vi.fn()
  readonly unobserve = vi.fn()
  readonly disconnect = vi.fn()
  readonly takeRecords = vi.fn(() => [])

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) {
    this.rootMargin = options.rootMargin ?? '0px'
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0]
    IntersectionObserverMock.instances.push(this)
  }

  fire(isIntersecting: boolean) {
    const rect = DOMRect.fromRect()
    const entry: IntersectionObserverEntry = {
      boundingClientRect: rect,
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: rect,
      isIntersecting,
      rootBounds: null,
      target: document.createElement('div'),
      time: performance.now()
    }
    this.callback([entry], this)
  }
}

const mountInfiniteScroll = (onLoad: () => void | Promise<void>, enabled = ref(true)) =>
  mount(
    defineComponent({
      setup() {
        const target = ref<HTMLElement | null>(null)
        const result = useInfiniteScroll(target, onLoad, { enabled })
        return { target, ...result }
      },
      template: '<div ref="target" />'
    })
  )

beforeEach(() => {
  IntersectionObserverMock.instances = []
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useInfiniteScroll', () => {
  it('observes the target and prevents duplicate async loads', async () => {
    let resolveLoad: (() => void) | undefined
    const onLoad = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve
        })
    )
    const wrapper = mountInfiniteScroll(onLoad)
    await nextTick()

    const observer = IntersectionObserverMock.instances.at(-1)
    expect(observer?.observe).toHaveBeenCalledWith(wrapper.element)

    observer?.fire(true)
    observer?.fire(true)
    expect(onLoad).toHaveBeenCalledTimes(1)

    resolveLoad?.()
    await nextTick()
  })

  it('disconnects while disabled and reconnects when enabled', async () => {
    const enabled = ref(true)
    mountInfiniteScroll(vi.fn(), enabled)
    await nextTick()
    const firstObserver = IntersectionObserverMock.instances.at(-1)

    enabled.value = false
    await nextTick()
    expect(firstObserver?.disconnect).toHaveBeenCalled()

    enabled.value = true
    await nextTick()
    expect(IntersectionObserverMock.instances.length).toBeGreaterThan(1)
  })
})
