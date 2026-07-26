import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
  ScrollToTop: {
    template: '<div data-test="scroll-to-top"></div>'
  },
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

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

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

    expect(wrapper.find('[data-test="scroll-to-top"]').exists()).toBe(true)

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

  it('debounces rapid search changes into one list request', async () => {
    const router = createTestRouter()
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true })
    const animeStore = useAnimeStore(pinia)
    const loadAnime = vi.fn<typeof animeStore.loadAnime>().mockResolvedValue(undefined)
    animeStore.loadAnime = loadAnime
    const searchFiltersStub = {
      props: ['searchQuery'],
      emits: ['update:searchQuery'],
      template: `
        <div>
          <button data-test="search-first" @click="$emit('update:searchQuery', 'Cowboy')">First</button>
          <button data-test="search-last" @click="$emit('update:searchQuery', 'Cowboy Bebop')">Last</button>
        </div>
      `
    }

    await router.push('/anime')
    await router.isReady()
    vi.useFakeTimers()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const wrapper = mount(AnimeIndex, {
      global: {
        plugins: [pinia, router],
        stubs: { ...stubs, SearchFilters: searchFiltersStub }
      }
    })

    await wrapper.get('[data-test="search-first"]').trigger('click')
    await wrapper.get('[data-test="search-last"]').trigger('click')

    expect(animeStore.searchQuery).toBe('Cowboy Bebop')
    expect(loadAnime).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(300)

    expect(loadAnime).toHaveBeenCalledOnce()
    expect(loadAnime).toHaveBeenCalledWith(true)
    expect(scrollTo).toHaveBeenCalledOnce()
  })
})
