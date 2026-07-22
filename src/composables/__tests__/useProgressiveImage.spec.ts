import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useProgressiveImage } from '../useProgressiveImage'

enableAutoUnmount(afterEach)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useProgressiveImage', () => {
  it('tracks load, source reset, and error completion', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false)
    const wrapper = mount(
      defineComponent({
        setup() {
          const source = ref('first.jpg')
          return { source, ...useProgressiveImage(source) }
        },
        template: `<div>
          <img ref="imageRef" :src="source" @load="handleLoad" @error="handleError" />
          <span>{{ isLoaded }}</span>
        </div>`
      })
    )

    await wrapper.get('img').trigger('load')
    expect(wrapper.get('span').text()).toBe('true')

    wrapper.vm.source = 'second.jpg'
    await wrapper.vm.$nextTick()
    expect(wrapper.get('span').text()).toBe('false')

    await wrapper.get('img').trigger('error')
    expect(wrapper.get('span').text()).toBe('true')
  })

  it('detects an image already loaded from cache', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    const wrapper = mount(
      defineComponent({
        setup() {
          const source = ref('cached.jpg')
          return { source, ...useProgressiveImage(source) }
        },
        template: '<div><img ref="imageRef" :src="source" /><span>{{ isLoaded }}</span></div>'
      })
    )

    await wrapper.vm.$nextTick()
    expect(wrapper.get('span').text()).toBe('true')
  })
})
