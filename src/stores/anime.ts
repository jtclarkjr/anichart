import { defineStore } from 'pinia'
import { getAnimeList, getAnimeDetails, getCurrentSeason } from '@/utils/api/anime.api'
import type { Media, AnimeListParams } from '@/utils/types/anilist'
import { MediaSort, MediaSeason } from '@/utils/types/anilist'

export interface AnimeState {
  // Current filtered/sorted data
  currentAnime: Media[]

  // UI state
  loading: boolean
  loadingMore: boolean
  error: string

  // Filters
  searchQuery: string
  selectedSort: MediaSort
  selectedSeason: MediaSeason | ''

  // Pagination
  currentPage: number
  itemsPerPage: number
  totalAvailable: number
  hasNextPage: boolean

  // Cache for different filter combinations
  cache: Record<string, { data: Media[]; page: number; hasMore: boolean }>
}

export const useAnimeStore = defineStore('anime', {
  state: (): AnimeState => {
    const { season } = getCurrentSeason()
    return {
      currentAnime: [],
      loading: false,
      loadingMore: false,
      error: '',
      searchQuery: '',
      selectedSort: MediaSort.POPULARITY_DESC,
      selectedSeason: season,
      currentPage: 1,
      itemsPerPage: 50,
      totalAvailable: 0,
      hasNextPage: true,
      cache: {}
    }
  },

  getters: {
    // Get current displayed anime (server-side filtered and sorted)
    displayedAnime(): Media[] {
      return this.currentAnime
    },

    // Check if there are more pages to load from server
    hasMoreToShow(): boolean {
      return this.hasNextPage
    },

    // Get current count of loaded results
    currentCount(): number {
      return this.currentAnime.length
    },

    // Generate cache key for current filter state
    cacheKey(): string {
      return `${this.searchQuery}-${this.selectedSort}-${this.selectedSeason}`
    }
  },

  actions: {
    // Helper: filter out adult content or explicit tags
    filterSafeAnime(list: Media[] = []): Media[] {
      const banned = new Set(['adult', 'hentai'])
      return list.filter((m) => {
        if (m.isAdult) return false
        // Case-insensitive check in genres
        const genres = (m.genres || []).map((g) => g.toLowerCase())
        return !genres.some((g) => banned.has(g))
      })
    },

    // Generate API parameters from current state
    getApiParams(): AnimeListParams {
      const params: AnimeListParams = {
        page: this.currentPage,
        perPage: this.itemsPerPage,
        sort: [this.selectedSort],
        isAdult: false
      }

      // Add search if present
      if (this.searchQuery.trim()) {
        params.search = this.searchQuery.trim()
      }

      // Add season filter if present
      if (this.selectedSeason) {
        params.season = this.selectedSeason
        // For seasonal anime, calculate the correct year
        const { season: currentSeason, year } = getCurrentSeason()
        // Winter season belongs to the next calendar year only if we're currently in Fall
        // (or later months that would make Winter refer to next year's Winter)
        params.seasonYear =
          this.selectedSeason === MediaSeason.WINTER && currentSeason === MediaSeason.FALL
            ? year + 1
            : year
      }

      return params
    },

    // Load anime with current filters and sorting
    async loadAnime(resetData: boolean = false) {
      // Generate cache key at the start for use throughout the function
      const cacheKey = this.cacheKey

      // For load more, don't use cache - always fetch fresh data
      if (!resetData) {
        // This is load more - keep existing data visible
        this.loadingMore = true
        this.error = ''
      } else {
        // This is a new search/filter - check cache first
        const cached = this.cache[cacheKey]

        if (cached) {
          // Use cached data for filters/search
          this.currentAnime = cached.data
          this.hasNextPage = cached.hasMore
          this.currentPage = cached.page
          return
        }

        this.loading = true
        this.error = ''
        this.currentPage = 1
        // Don't clear currentAnime yet - wait for successful response
      }

      // Store previous data to avoid "no anime found" flash
      const previousAnime = resetData ? [] : this.currentAnime

      try {
        const result = await getAnimeList(this.getApiParams())

        if (!result.media || result.media.length === 0) {
          // If no results and this is initial load, try fallback strategies
          if (resetData && this.selectedSeason && this.currentAnime.length === 0) {
            console.log(`No results for ${this.selectedSeason} season, trying fallbacks...`)

            // Try previous seasons first
            const { season: currentSeason, year } = getCurrentSeason()
            const fallbackSeasons: MediaSeason[] = []

            if (currentSeason === MediaSeason.WINTER) {
              fallbackSeasons.push(MediaSeason.FALL, MediaSeason.SUMMER)
            } else if (currentSeason === MediaSeason.SPRING) {
              fallbackSeasons.push(MediaSeason.WINTER, MediaSeason.FALL)
            } else if (currentSeason === MediaSeason.SUMMER) {
              fallbackSeasons.push(MediaSeason.SPRING, MediaSeason.WINTER)
            } else if (currentSeason === MediaSeason.FALL) {
              fallbackSeasons.push(MediaSeason.SUMMER, MediaSeason.SPRING)
            }

            // Try previous seasons
            for (const fallbackSeason of fallbackSeasons) {
              const seasonYear =
                fallbackSeason === MediaSeason.WINTER && currentSeason !== MediaSeason.WINTER
                  ? year + 1
                  : year
              const fallbackResult = await getAnimeList({
                ...this.getApiParams(),
                season: fallbackSeason,
                seasonYear
              })

              if (fallbackResult.media && fallbackResult.media.length > 0) {
                console.log(`Found results in ${fallbackSeason} season`)
                this.currentAnime = this.filterSafeAnime(fallbackResult.media)
                this.totalAvailable = fallbackResult.pageInfo?.total || 0
                this.hasNextPage = fallbackResult.pageInfo?.hasNextPage || false

                // Update the selected season to the working one
                this.selectedSeason = fallbackSeason

                // Cache the fallback result
                this.cache[this.cacheKey] = {
                  data: this.currentAnime,
                  page: this.currentPage,
                  hasMore: this.hasNextPage
                }
                return
              }
            }

            // If seasonal fallbacks don't work, try without season filter
            const noSeasonParams = { ...this.getApiParams() }
            delete noSeasonParams.season
            delete noSeasonParams.seasonYear
            // Ensure adult filter is maintained
            noSeasonParams.isAdult = false
            const noSeasonResult = await getAnimeList(noSeasonParams)

            if (noSeasonResult.media && noSeasonResult.media.length > 0) {
              this.currentAnime = this.filterSafeAnime(noSeasonResult.media)
              this.totalAvailable = noSeasonResult.pageInfo?.total || 0
              this.hasNextPage = noSeasonResult.pageInfo?.hasNextPage || false

              // Clear season filter since we're showing all anime
              this.selectedSeason = ''

              // Cache the result
              this.cache[this.cacheKey] = {
                data: this.currentAnime,
                page: this.currentPage,
                hasMore: this.hasNextPage
              }
              return
            }
          }
        }

        const filteredResult = this.filterSafeAnime(result.media)
        const newAnime = resetData ? filteredResult : [...previousAnime, ...filteredResult]

        this.currentAnime = newAnime
        this.totalAvailable = result.pageInfo?.total || 0
        this.hasNextPage = result.pageInfo?.hasNextPage || false

        // Update cache
        this.cache[cacheKey] = {
          data: newAnime,
          page: this.currentPage,
          hasMore: this.hasNextPage
        }
      } catch (error) {
        this.error = 'Failed to load anime data. Please try again.'
        console.error('Error loading anime data:', error)
        // Restore previous data on error if we had some
        if (resetData && previousAnime.length === 0) {
          this.currentAnime = []
        }
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },

    // Initial load - called when app starts
    async loadInitialData() {
      // Only load if we don't have any data yet
      if (this.currentAnime.length === 0 && !this.loading) {
        await this.loadAnime(true)
      }
    },

    // Load next page of data
    async loadMoreData() {
      if (this.loading || this.loadingMore || !this.hasNextPage) return

      this.currentPage++
      await this.loadAnime(false)
    },

    // Update search query and reload data
    async setSearchQuery(query: string) {
      this.searchQuery = query
      await this.loadAnime(true)
    },

    // Update sort option and reload data
    async setSort(sort: MediaSort) {
      this.selectedSort = sort
      await this.loadAnime(true)
    },

    // Update season filter and reload data
    async setSeason(season: MediaSeason | '') {
      this.selectedSeason = season
      await this.loadAnime(true)
    },

    // Clear all filters and reload
    async clearFilters() {
      this.searchQuery = ''
      this.selectedSort = MediaSort.POPULARITY_DESC
      this.selectedSeason = ''
      await this.loadAnime(true)
    },

    // Reset state for navigation
    resetState() {
      this.currentAnime = []
      this.loading = false
      this.loadingMore = false
      this.error = ''
      this.currentPage = 1
      this.totalAvailable = 0
      this.hasNextPage = true
      this.cache = {}
    },

    // Get anime by ID from current loaded data
    getAnimeById(id: number): Media | undefined {
      return this.currentAnime.find((anime) => anime.id === id)
    },

    // Load single anime details (always fetch fresh data for details)
    async loadAnimeDetails(id: number): Promise<Media> {
      try {
        return await getAnimeDetails(id)
      } catch (error) {
        console.error('Error loading anime details:', error)
        throw error
      }
    }
  }
})
