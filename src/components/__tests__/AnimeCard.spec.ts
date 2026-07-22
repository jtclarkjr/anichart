import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AnimeCard from '../AnimeCard.vue'
import { MediaType, type Media, type MediaCoverImage } from '@/utils/types/anilist'

const createAnime = (coverImage: MediaCoverImage): Media => ({
  id: 1,
  title: { english: 'Test Anime', romaji: null, native: null },
  description: null,
  startDate: { year: 2026, month: 1, day: 1 },
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
  genres: ['Action', 'Drama'],
  averageScore: 85,
  meanScore: null,
  popularity: null,
  favourites: null,
  hashtag: null,
  isAdult: false,
  countryOfOrigin: null,
  coverImage,
  bannerImage: null,
  studios: null,
  source: null
})

const completeSpy = (complete: boolean) =>
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(complete)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AnimeCard', () => {
  it('renders responsive cover image attributes without duplicate fallbacks', () => {
    completeSpy(false)
    const wrapper = mount(AnimeCard, {
      props: {
        anime: createAnime({
          medium: 'https://example.com/small.jpg',
          large: 'https://example.com/large.jpg',
          extraLarge: 'https://example.com/large.jpg',
          color: null
        })
      }
    })
    const image = wrapper.get('img')

    expect(image.attributes('src')).toBe('https://example.com/large.jpg')
    expect(image.attributes('srcset')).toBe(
      'https://example.com/small.jpg 100w, https://example.com/large.jpg 230w'
    )
    expect(image.attributes('sizes')).toBe(
      '(min-width: 1024px) 220px, (min-width: 768px) 200px, (min-width: 640px) 180px, (min-width: 480px) 160px, 140px'
    )
    expect(image.attributes('loading')).toBe('lazy')
    expect(image.attributes('decoding')).toBe('async')
  })

  it('fades the cover in after loading or failing', async () => {
    completeSpy(false)
    const wrapper = mount(AnimeCard, {
      props: {
        anime: createAnime({
          medium: null,
          large: 'https://example.com/large.jpg',
          extraLarge: 'https://example.com/extra-large.jpg',
          color: null
        })
      }
    })
    const image = wrapper.get('img')

    expect(image.classes()).not.toContain('image-loaded')
    await image.trigger('load')
    expect(image.classes()).toContain('image-loaded')

    await wrapper.setProps({
      anime: createAnime({
        medium: null,
        large: 'https://example.com/replacement.jpg',
        extraLarge: null,
        color: null
      })
    })
    expect(image.classes()).not.toContain('image-loaded')
    await image.trigger('error')
    expect(image.classes()).toContain('image-loaded')
  })

  it('shows a cover that was already loaded from cache', async () => {
    completeSpy(true)
    const wrapper = mount(AnimeCard, {
      props: {
        anime: createAnime({
          medium: null,
          large: 'https://example.com/cached.jpg',
          extraLarge: null,
          color: null
        })
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.get('img').classes()).toContain('image-loaded')
  })
})
