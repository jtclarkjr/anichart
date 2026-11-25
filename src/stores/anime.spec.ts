import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { createPinia, setActivePinia } from 'pinia'
import { useAnimeStore } from './anime'
import { getAnimeDetails, getAnimeList } from '@/utils/api/anime.api'
import { MediaSeason, MediaSort, MediaType, type Media, type Page } from '@/utils/types/anilist'

vi.mock('@/utils/api/anime.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/api/anime.api')>()),
  getAnimeDetails: vi.fn(),
  getAnimeList: vi.fn(),
  getCurrentSeason: () => ({ season: MediaSeason.FALL, year: 2026 })
}))

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

const createPage = (...media: Media[]): Page => ({
  media,
  pageInfo: {
    total: media.length,
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    perPage: 50
  }
})

const mockedGetAnimeDetails = vi.mocked(getAnimeDetails)
const mockedGetAnimeList = vi.mocked(getAnimeList)

beforeEach(() => {
  setActivePinia(createPinia())
  mockedGetAnimeDetails.mockReset()
  mockedGetAnimeList.mockReset()
})

describe('anime detail cache', () => {
  it('returns an existing detail record without querying AniList', async () => {
    const anime = createAnime(1)
    const store = useAnimeStore()
    store.animeDetailsById[anime.id] = anime

    await expect(store.loadAnimeDetails(anime.id)).resolves.toStrictEqual(anime)
    expect(mockedGetAnimeDetails).not.toHaveBeenCalled()
  })

  it('queries and stores an uncached detail record', async () => {
    const anime = createAnime(2)
    mockedGetAnimeDetails.mockResolvedValue(anime)
    const store = useAnimeStore()

    await expect(store.loadAnimeDetails(anime.id)).resolves.toStrictEqual(anime)
    expect(mockedGetAnimeDetails).toHaveBeenCalledWith(anime.id)
    expect(store.animeDetailsById[anime.id]).toStrictEqual(anime)
  })

  it('keeps detail records during a routine list-state reset and can invalidate one record', () => {
    const anime = createAnime(3)
    const store = useAnimeStore()
    store.animeDetailsById[anime.id] = anime

    store.resetState()
    expect(store.animeDetailsById[anime.id]).toStrictEqual(anime)

    store.invalidateAnimeDetails(anime.id)
    expect(store.animeDetailsById[anime.id]).toBeUndefined()
  })

  it('stops pagination after an API failure instead of retrying automatically', async () => {
    const store = useAnimeStore()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedGetAnimeList.mockRejectedValueOnce(new Error('Rate limited'))
    store.currentAnime = [createAnime(4)]
    store.currentPage = 2

    await store.loadAnime(false)

    expect(store.error).toBe('Failed to load anime data. Please try again.')
    expect(store.hasNextPage).toBe(false)

    await store.loadMoreData()

    expect(mockedGetAnimeList).toHaveBeenCalledTimes(1)
    expect(store.currentPage).toBe(2)
    consoleError.mockRestore()
  })
})

describe('anime list season filtering', () => {
  it('enables pagination only after the first page reports more results', async () => {
    const store = useAnimeStore()
    const firstPage = createPage(createAnime(9))
    firstPage.pageInfo.hasNextPage = true
    mockedGetAnimeList.mockResolvedValueOnce(firstPage).mockResolvedValueOnce(createPage())

    await store.loadMoreData()
    await store.loadInitialData()
    await store.loadMoreData()

    expect(mockedGetAnimeList.mock.calls.map(([params]) => params?.page)).toEqual([1, 2])
  })

  it('keeps the season and year when an unmatched search is cleared and retyped', async () => {
    const store = useAnimeStore()
    const anime = createAnime(5)
    store.selectedSeason = MediaSeason.WINTER
    store.currentAnime = [anime]
    mockedGetAnimeList.mockImplementation(({ search, season } = {}) =>
      Promise.resolve(!season || search === 'second title' ? createPage(anime) : createPage())
    )

    await store.setSearchQuery('unmatched')
    expect(store.currentAnime).toStrictEqual([])

    await store.setSearchQuery('')
    expect(store.currentAnime).toStrictEqual([])
    expect(store.selectedSeason).toBe(MediaSeason.WINTER)

    await store.setSearchQuery('second title')
    expect(store.currentAnime).toStrictEqual([anime])
    expect(store.selectedSeason).toBe(MediaSeason.WINTER)

    const seasonalParams = {
      page: 1,
      perPage: 50,
      sort: [MediaSort.POPULARITY_DESC],
      isAdult: false,
      season: MediaSeason.WINTER,
      seasonYear: 2027
    }
    expect(mockedGetAnimeList.mock.calls).toStrictEqual([
      [{ ...seasonalParams, search: 'unmatched' }],
      [seasonalParams],
      [{ ...seasonalParams, search: 'second title' }]
    ])
  })

  it.each(['network', 'cache'])(
    'keeps restored %s results when an older search finishes',
    async (source) => {
      const store = useAnimeStore()
      const seasonalAnime = createAnime(6)
      if (source === 'cache') {
        mockedGetAnimeList.mockResolvedValueOnce(createPage(seasonalAnime))
        await store.loadInitialData()
        mockedGetAnimeList.mockClear()
      }

      let resolveSearch: ((page: Page) => void) | undefined
      mockedGetAnimeList.mockReturnValueOnce(
        new Promise<Page>((resolve) => {
          resolveSearch = resolve
        })
      )
      mockedGetAnimeList.mockResolvedValueOnce(createPage(seasonalAnime))

      const pendingSearch = store.setSearchQuery('older title')
      await store.setSearchQuery('')
      expect(store.currentAnime).toStrictEqual([seasonalAnime])
      expect(store.loading).toBe(false)
      expect(mockedGetAnimeList).toHaveBeenCalledTimes(source === 'cache' ? 1 : 2)

      resolveSearch?.(createPage(createAnime(7)))
      await pendingSearch

      expect(store.currentAnime).toStrictEqual([seasonalAnime])
      expect(store.selectedSeason).toBe(MediaSeason.FALL)
    }
  )

  it('can fall back to an unfiltered list during initial load', async () => {
    const store = useAnimeStore()
    const anime = createAnime(8)
    mockedGetAnimeList.mockImplementation(({ season } = {}) =>
      Promise.resolve(season ? createPage() : createPage(anime))
    )

    await store.loadInitialData()

    expect(mockedGetAnimeList.mock.calls.map(([params]) => params?.season)).toStrictEqual([
      MediaSeason.FALL,
      MediaSeason.SUMMER,
      MediaSeason.SPRING,
      undefined
    ])
    expect(store.currentAnime).toStrictEqual([anime])
    expect(store.selectedSeason).toBe('')
  })
})
