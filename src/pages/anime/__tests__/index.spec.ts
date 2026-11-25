import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount } from '@vue/test-utils'
import { createSSRApp, nextTick } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import AnimeIndex from '../index.vue'
import AnimeGrid from '@/components/anime/AnimeGrid.vue'
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
    props: { hasMoreToShow: Boolean },
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

const createAnimePageRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/anime', component: AnimeIndex }]
  })

const renderAnimePage = async (pinia: ReturnType<typeof createTestingPinia>) => {
  const router = createAnimePageRouter()
  await router.push('/anime')

  return renderToString(createSSRApp(RouterView).use(router).use(pinia))
}

describe('Anime list initial loading', () => {
  const listError = 'Failed to load anime data. Please try again.'

  it('server-renders anime after successful prefetch', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn })
    const store = useAnimeStore(pinia)
    const loadInitialData = vi.fn(() => {
      store.currentAnime = [createAnime(1)]
      return Promise.resolve()
    })
    store.loadInitialData = loadInitialData

    const html = await renderAnimePage(pinia)

    expect(loadInitialData).toHaveBeenCalledOnce()
    expect(html).toContain('Anime 1')
    expect(html).not.toContain('Loading anime...')
  })

  it('server-renders a spinner while a failed prefetch awaits a client retry', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn })
    const store = useAnimeStore(pinia)
    const loadInitialData = vi.fn(() => {
      store.error = listError
      return Promise.resolve()
    })
    store.loadInitialData = loadInitialData

    const html = await renderAnimePage(pinia)

    expect(loadInitialData).toHaveBeenCalledOnce()
    expect(html).toContain('Loading anime...')
    expect(html).not.toContain(listError)
  })

  it('shows the error after the client retry fails', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn })
    const store = useAnimeStore(pinia)
    store.error = listError
    const loadInitialData = vi.fn(async () => {
      store.error = ''
      store.loading = true
      await nextTick()
      store.loading = false
      store.error = listError
    })
    store.loadInitialData = loadInitialData

    const router = createAnimePageRouter()
    await router.push('/anime')
    const wrapper = mount(RouterView, {
      global: { plugins: [pinia, router], stubs: { ...stubs, AnimeGrid: false } }
    })

    expect(wrapper.get('.loading').text()).toContain('Loading anime...')
    await flushPromises()

    expect(loadInitialData).toHaveBeenCalledOnce()
    expect(wrapper.get('.error').text()).toContain(listError)
    wrapper.unmount()
  })
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
    animeStore.currentAnime = [createAnime(1)]
    animeStore.hasNextPage = true
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

    const grid = wrapper.getComponent(AnimeGrid)
    expect(grid.props('hasMoreToShow')).toBe(true)

    await wrapper.get('[data-test="search-first"]').trigger('click')
    await wrapper.get('[data-test="search-last"]').trigger('click')

    expect(animeStore.searchQuery).toBe('Cowboy Bebop')
    expect(grid.props('hasMoreToShow')).toBe(false)
    expect(loadAnime).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(300)

    expect(loadAnime).toHaveBeenCalledOnce()
    expect(loadAnime).toHaveBeenCalledWith(true)
    expect(grid.props('hasMoreToShow')).toBe(true)
    expect(scrollTo).toHaveBeenCalledOnce()
  })
})
