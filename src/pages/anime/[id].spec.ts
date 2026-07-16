import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import AnimeDetails from './[id].vue'
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
  AnimeBanner: {
    props: ['anime'],
    template: '<div data-test="anime-title">{{ anime.title.english }}</div>'
  },
  AnimeDescription: true,
  AnimeMetadata: true
}

describe('Anime details navigation', () => {
  it('renders SSR-hydrated details without loading again on mount', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const router = createTestRouter()
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
      initialState: { anime: { animeDetailsById: { 1: createAnime(1) } } }
    })
    const animeStore = useAnimeStore(pinia)
    const loadAnimeDetails = vi.fn()
    animeStore.loadAnimeDetails = loadAnimeDetails

    await router.push('/anime/1')
    await router.isReady()

    const wrapper = mount(AnimeDetails, { global: { plugins: [pinia, router], stubs } })
    await flushPromises()

    expect(wrapper.get('[data-test="anime-title"]').text()).toBe('Anime 1')
    expect(wrapper.find('.loading').exists()).toBe(false)
    expect(loadAnimeDetails).not.toHaveBeenCalled()
    expect(scrollTo).toHaveBeenCalledWith(0, 0)

    scrollTo.mockRestore()
  })

  it('uses a cached route target and loads an uncached target once', async () => {
    const router = createTestRouter()
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
      initialState: {
        anime: { animeDetailsById: { 1: createAnime(1), 2: createAnime(2) } }
      }
    })
    const animeStore = useAnimeStore(pinia)
    const initialLoadAnimeDetails = vi.fn()
    animeStore.loadAnimeDetails = initialLoadAnimeDetails

    await router.push('/anime/1')
    await router.isReady()

    const wrapper = mount(AnimeDetails, { global: { plugins: [pinia, router], stubs } })
    await flushPromises()

    await router.push('/anime/2')
    await flushPromises()
    expect(wrapper.get('[data-test="anime-title"]').text()).toBe('Anime 2')
    expect(initialLoadAnimeDetails).not.toHaveBeenCalled()

    const loadAnimeDetails = vi.fn(() => Promise.resolve(createAnime(3)))
    animeStore.loadAnimeDetails = loadAnimeDetails
    await router.push('/anime/3')
    await flushPromises()

    expect(loadAnimeDetails).toHaveBeenCalledTimes(1)
    expect(loadAnimeDetails).toHaveBeenCalledWith(3)
  })

  it('keeps a direct link to the anime list available while details are loading', async () => {
    const router = createTestRouter()
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true })
    const animeStore = useAnimeStore(pinia)
    animeStore.loadAnimeDetails = vi.fn(() => new Promise<Media>(() => {}))

    await router.push('/anime/1')
    await router.isReady()

    const wrapper = mount(AnimeDetails, { global: { plugins: [pinia, router], stubs } })
    await wrapper.vm.$nextTick()

    const listLink = wrapper.get('a.back-to-list')
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(listLink.text()).toBe('Back')
    expect(listLink.attributes('aria-label')).toBe('Back to anime list')
    expect(listLink.attributes('href')).toBe('/anime')

    await listLink.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/anime')
  })
})
