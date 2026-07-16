import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import AnimeIndex from './index.vue'
import { useAnimeStore } from '@/stores/anime'
import { MediaType, type Media } from '@/utils/types/anilist'

const createAnime = (id: number): Media => ({
  id,
  title: { english: `Anime ${id}`, romaji: null, native: null },
  description: null,
  startDate: null,
  endDate: null,
  season: null,
  seasonYear: null,
  type: MediaType.ANIME,
  format: null,
  status: null,
  episodes: null,
  duration: null,
  chapters: null,
  volumes: null,
  genres: [],
  averageScore: null,
  meanScore: null,
  popularity: null,
  favourites: null,
  hashtag: null,
  isAdult: false,
  countryOfOrigin: null,
  coverImage: { medium: null, large: null, extraLarge: null, color: null },
  bannerImage: null,
  studios: null,
  source: null
})

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/anime', component: { template: '<div>Anime list</div>' } },
      { path: '/anime/:id', component: { template: '<div>Anime details</div>' } }
    ]
  })

const stubs = {
  SearchFilters: true,
  AnimeGrid: {
    emits: ['animeClick'],
    template: '<button data-test="open-details" @click="$emit(\'animeClick\', 1)">Open</button>'
  }
}

const createPendingAnimeRequest = () => {
  let resolve: ((anime: Media) => void) | undefined
  const promise = new Promise<Media>((promiseResolve) => {
    resolve = promiseResolve
  })

  return {
    promise,
    resolve: (anime: Media) => resolve?.(anime)
  }
}

describe('Anime list detail navigation', () => {
  it('waits for a successful prefetch before navigating', async () => {
    const router = createTestRouter()
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true })
    const animeStore = useAnimeStore(pinia)
    const { promise: prefetchPromise, resolve: resolvePrefetch } = createPendingAnimeRequest()
    const loadAnimeDetails = vi.fn(() => prefetchPromise)
    animeStore.loadAnimeDetails = loadAnimeDetails

    await router.push('/anime')
    await router.isReady()
    const wrapper = mount(AnimeIndex, { global: { plugins: [pinia, router], stubs } })

    await wrapper.get('[data-test="open-details"]').trigger('click')
    expect(router.currentRoute.value.path).toBe('/anime')

    resolvePrefetch(createAnime(1))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/anime/1'))
    expect(loadAnimeDetails).toHaveBeenCalledWith(1)
  })

  it('still navigates to the error-capable detail route when prefetch fails', async () => {
    const router = createTestRouter()
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true })
    const animeStore = useAnimeStore(pinia)
    const loadAnimeDetails = vi.fn(() => Promise.reject(new Error('Network error')))
    animeStore.loadAnimeDetails = loadAnimeDetails

    await router.push('/anime')
    await router.isReady()
    const wrapper = mount(AnimeIndex, { global: { plugins: [pinia, router], stubs } })

    await wrapper.get('[data-test="open-details"]').trigger('click')

    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/anime/1'))
    expect(loadAnimeDetails).toHaveBeenCalledWith(1)
  })
})
