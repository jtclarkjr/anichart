import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import AnimeDetails from './[id].vue'
import { useAnimeStore } from '@/stores/anime'
import type { Media } from '@/utils/types/anilist'

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/anime', component: { template: '<div>Anime list</div>' } },
      { path: '/anime/:id', component: { template: '<div>Anime details</div>' } }
    ]
  })

describe('Anime details navigation', () => {
  it('keeps a direct link to the anime list available while details are loading', async () => {
    const router = createTestRouter()
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true })
    const animeStore = useAnimeStore(pinia)
    animeStore.loadAnimeDetails = vi.fn(() => new Promise<Media>(() => {}))

    await router.push('/anime/1')
    await router.isReady()

    const wrapper = mount(AnimeDetails, {
      global: {
        plugins: [pinia, router],
        stubs: {
          AnimeBanner: true,
          AnimeDescription: true,
          AnimeMetadata: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    const listLink = wrapper.get('a.back-to-list')
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(listLink.text()).toBe('Anime list')
    expect(listLink.attributes('aria-label')).toBe('Back to anime list')
    expect(listLink.attributes('href')).toBe('/anime')

    await listLink.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/anime')
  })
})
