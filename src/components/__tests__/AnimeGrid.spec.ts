import { mount } from '@vue/test-utils'
import { TransitionGroup } from 'vue'
import { describe, expect, it } from 'vitest'
import AnimeCard from '../AnimeCard.vue'
import AnimeGrid from '../AnimeGrid.vue'
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

const createProps = (anime: Media[]) => ({
  anime,
  loading: false,
  loadingMore: false,
  error: '',
  hasData: anime.length > 0,
  hasMoreToShow: false,
  totalCount: anime.length
})

const getCardStyle = (wrapper: ReturnType<typeof mount>, index: number): string => {
  const card = wrapper.findAllComponents(AnimeCard)[index]
  if (!card) throw new Error(`Missing anime card at index ${index}`)
  return card.attributes('style') ?? ''
}

describe('AnimeGrid', () => {
  it('uses an appearing transition group with capped initial delays', () => {
    const anime = Array.from({ length: 12 }, (_, index) => createAnime(index + 1))
    const wrapper = mount(AnimeGrid, { props: createProps(anime) })
    const transitionGroup = wrapper.findComponent(TransitionGroup)

    expect(transitionGroup.props('name')).toBe('anime-card')
    expect(transitionGroup.props('appear')).toBe(true)
    expect(getCardStyle(wrapper, 0)).toContain('--card-delay: 0ms')
    expect(getCardStyle(wrapper, 5)).toContain('--card-delay: 200ms')
    expect(getCardStyle(wrapper, 11)).toContain('--card-delay: 400ms')
  })

  it('restarts the capped stagger for appended cards', async () => {
    const initialAnime = [createAnime(1), createAnime(2)]
    const wrapper = mount(AnimeGrid, { props: createProps(initialAnime) })
    const appendedAnime = [
      ...initialAnime,
      ...Array.from({ length: 12 }, (_, index) => createAnime(index + 3))
    ]

    await wrapper.setProps(createProps(appendedAnime))

    expect(getCardStyle(wrapper, 2)).toContain('--card-delay: 0ms')
    expect(getCardStyle(wrapper, 7)).toContain('--card-delay: 200ms')
    expect(getCardStyle(wrapper, 13)).toContain('--card-delay: 400ms')
  })
})
