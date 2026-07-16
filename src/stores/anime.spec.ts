import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAnimeStore } from './anime'
import { getAnimeDetails } from '@/utils/api/anime.api'
import { MediaType, type Media } from '@/utils/types/anilist'

vi.mock('@/utils/api/anime.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/api/anime.api')>()),
  getAnimeDetails: vi.fn()
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

const mockedGetAnimeDetails = vi.mocked(getAnimeDetails)

describe('anime detail cache', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGetAnimeDetails.mockReset()
  })

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
})
