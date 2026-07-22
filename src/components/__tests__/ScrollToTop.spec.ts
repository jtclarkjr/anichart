import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ScrollToTop from '../utils/ScrollToTop.vue'

enableAutoUnmount(afterEach)

const setViewport = (scrollY: number, innerHeight = 800) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight })
}

const createMatchMedia = (matches: boolean) =>
  vi.fn(
    (media: string): MediaQueryList => ({
      matches,
      media,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true)
    })
  )

beforeEach(() => {
  setViewport(0)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ScrollToTop', () => {
  it('only appears after the user scrolls one viewport', async () => {
    const wrapper = mount(ScrollToTop)

    expect(wrapper.find('button').exists()).toBe(false)

    setViewport(800)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    expect(wrapper.get('button').attributes('aria-label')).toBe('Scroll to top')
    expect(wrapper.get('button').attributes('type')).toBe('button')

    setViewport(799)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('scrolls smoothly to the top by default', async () => {
    setViewport(800)
    vi.stubGlobal('matchMedia', createMatchMedia(false))
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(ScrollToTop)

    await wrapper.vm.$nextTick()

    await wrapper.get('button').trigger('click')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('uses instant scrolling when reduced motion is preferred', async () => {
    setViewport(800)
    vi.stubGlobal('matchMedia', createMatchMedia(true))
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(ScrollToTop)

    await wrapper.vm.$nextTick()

    await wrapper.get('button').trigger('click')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
