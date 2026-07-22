import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScrollToTop } from '../useScrollToTop'

enableAutoUnmount(afterEach)

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useScrollToTop', () => {
  it('supports a reactive numeric visibility threshold', async () => {
    const threshold = ref(100)
    const wrapper = mount(
      defineComponent({
        setup() {
          return useScrollToTop({ threshold })
        },
        template: '<span>{{ isVisible }}</span>'
      })
    )

    setScrollY(99)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe('false')

    setScrollY(100)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe('true')
  })

  it('honors reduced motion when scrolling', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    )
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(
      defineComponent({
        setup() {
          return useScrollToTop()
        },
        template: '<button @click="scrollToTop">Top</button>'
      })
    )

    void wrapper.get('button').trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
