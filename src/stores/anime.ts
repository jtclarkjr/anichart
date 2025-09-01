import { defineStore } from 'pinia'
import {
  getAnimeList,
  getAnimeDetails,
  getDisplayTitle,
  getCurrentSeason
} from '@/utils/api/anime.api'
import type { Media } from '@/utils/types/anilist'
import { MediaSort, MediaSeason } from '@/utils/types/anilist'

export interface AnimeState {
  // All anime data
  allAnime: Media[]

  // UI state
  loading: boolean
  error: string

  // Filters
  searchQuery: string
  selectedSort: MediaSort
  selectedSeason: MediaSeason | ''

  // Pagination for display
  displayCount: number
  itemsPerPage: number

  // Data fetching state
  isDataLoaded: boolean
  totalAvailable: number
}

export const useAnimeStore = defineStore('anime', {
  state: (): AnimeState => {
    const { season } = getCurrentSeason()
    return {
      allAnime: [],
      loading: false,
      error: '',
      searchQuery: '',
      selectedSort: MediaSort.POPULARITY_DESC,
      selectedSeason: season, // Default to current season
      displayCount: 40, // Start with 40 items displayed
      itemsPerPage: 20,
      isDataLoaded: false,
      totalAvailable: 0
    }
  },

  getters: {
    // Filter and sort anime based on current filters
    filteredAnime(state): Media[] {
      let filtered = [...state.allAnime]

      // Apply search filter
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter((anime) => {
          const title = getDisplayTitle(anime.title).toLowerCase()
          const romaji = anime.title.romaji?.toLowerCase() || ''
          const english = anime.title.english?.toLowerCase() || ''
          const native = anime.title.native?.toLowerCase() || ''

          return (
            title.includes(query) ||
            romaji.includes(query) ||
            english.includes(query) ||
            native.includes(query) ||
            anime.genres.some((genre) => genre.toLowerCase().includes(query))
          )
        })
      }

      // Apply season filter
      if (state.selectedSeason) {
        filtered = filtered.filter((anime) => anime.season === state.selectedSeason)
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (state.selectedSort) {
          case MediaSort.POPULARITY_DESC:
            return (b.popularity || 0) - (a.popularity || 0)
          case MediaSort.TRENDING_DESC:
            // For trending, we'll use a combination of popularity and recent date
            const aScore = (a.popularity || 0) + (a.favourites || 0)
            const bScore = (b.popularity || 0) + (b.favourites || 0)
            return bScore - aScore
          case MediaSort.SCORE_DESC:
            return (b.averageScore || 0) - (a.averageScore || 0)
          case MediaSort.START_DATE_DESC:
            const aYear = a.startDate?.year || 0
            const bYear = b.startDate?.year || 0
            if (aYear !== bYear) return bYear - aYear
            const aMonth = a.startDate?.month || 0
            const bMonth = b.startDate?.month || 0
            return bMonth - aMonth
          default:
            return 0
        }
      })

      return filtered
    },

    // Get anime to display based on current display count
    displayedAnime(): Media[] {
      return this.filteredAnime.slice(0, this.displayCount)
    },

    // Check if there are more items to load
    hasMoreToShow(): boolean {
      return this.filteredAnime.length > this.displayCount
    },

    // Get total count of filtered results
    filteredCount(): number {
      return this.filteredAnime.length
    }
  },

  actions: {
    // Load initial anime data (focus on current season and popular anime)
    async loadAllAnime() {
      if (this.isDataLoaded && this.allAnime.length > 0) {
        return // Already loaded
      }

      this.loading = true
      this.error = ''

      // Don't clear cache to avoid unnecessary API calls when navigating
      // Cache will be cleared automatically when browser is refreshed

      try {
        const { season, year } = getCurrentSeason()
        const promises: Promise<{ media: Media[]; pageInfo?: { total: number } }>[] = []

        // Load Spring, Summer, Fall of current year (reduced to avoid rate limits)
        const currentYearSeasons: MediaSeason[] = [
          MediaSeason.SPRING,
          MediaSeason.SUMMER,
          MediaSeason.FALL
        ]
        for (const seasonType of currentYearSeasons) {
          // Load fewer pages to avoid rate limiting - current season gets 4, others get 2
          const pagesToLoad = seasonType === season ? 4 : 2

          for (let page = 1; page <= pagesToLoad; page++) {
            promises.push(
              getAnimeList({
                page,
                perPage: 50, // Increase per page to get more data with fewer requests
                season: seasonType,
                seasonYear: year,
                sort: [MediaSort.POPULARITY_DESC]
              })
            )
          }
        }

        // Load Winter of next year (reduced pages)
        for (let page = 1; page <= 2; page++) {
          promises.push(
            getAnimeList({
              page,
              perPage: 50,
              season: MediaSeason.WINTER,
              seasonYear: year + 1,
              sort: [MediaSort.POPULARITY_DESC]
            })
          )
        }

        const results = await Promise.all(promises)

        // Combine all anime from all pages
        const allMedia = results.flatMap((result) => result.media)

        // Remove duplicates (just in case)
        const uniqueAnime = allMedia.filter(
          (anime, index, self) => index === self.findIndex((a) => a.id === anime.id)
        )

        this.allAnime = uniqueAnime
        this.totalAvailable = results[0]?.pageInfo?.total || uniqueAnime.length
        this.isDataLoaded = true
      } catch (error) {
        this.error = 'Failed to load anime data. Please try again.'
        console.error('Error loading anime data:', error)
      } finally {
        this.loading = false
      }
    },

    // Load more data if needed (for when we need more variety)
    async loadMoreData() {
      if (this.loading) return

      this.loading = true

      try {
        const nextPage = Math.floor(this.allAnime.length / 20) + 1
        const result = await getAnimeList({
          page: nextPage,
          perPage: 20,
          sort: [MediaSort.POPULARITY_DESC]
        })

        // Add new anime to existing collection
        const newAnime = result.media.filter(
          (anime) => !this.allAnime.find((existing) => existing.id === anime.id)
        )

        this.allAnime = [...this.allAnime, ...newAnime]
      } catch (error) {
        this.error = 'Failed to load more anime data.'
        console.error('Error loading more anime data:', error)
      } finally {
        this.loading = false
      }
    },

    // Show more items (for infinite scroll-like behavior)
    showMoreItems() {
      this.displayCount += this.itemsPerPage
    },

    // Update search query
    setSearchQuery(query: string) {
      this.searchQuery = query
      this.resetDisplayCount()
    },

    // Update sort option
    setSort(sort: MediaSort) {
      this.selectedSort = sort
      this.resetDisplayCount()
    },

    // Update season filter
    setSeason(season: MediaSeason | '') {
      this.selectedSeason = season
      this.resetDisplayCount()
    },

    // Reset display count when filters change
    resetDisplayCount() {
      this.displayCount = 40
    },

    // Clear all filters
    clearFilters() {
      this.searchQuery = ''
      this.selectedSort = MediaSort.POPULARITY_DESC
      this.selectedSeason = ''
      this.resetDisplayCount()
    },

    // Get anime by ID (for details page)
    getAnimeById(id: number): Media | undefined {
      return this.allAnime.find((anime) => anime.id === id)
    },

    // Load single anime details if not in store
    async loadAnimeDetails(id: number): Promise<Media> {
      // First check if we already have it
      const existingAnime = this.getAnimeById(id)
      if (existingAnime) {
        return existingAnime
      }

      // If not found, fetch from API
      try {
        const anime = await getAnimeDetails(id)

        // Add to store for future reference
        this.allAnime = [...this.allAnime, anime]

        return anime
      } catch (error) {
        console.error('Error loading anime details:', error)
        throw error
      }
    }
  }
})
