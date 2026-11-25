import { defineStore } from 'pinia'
import { getAnimeList, getAnimeDetails, getCurrentSeason } from '@/utils/api/anime.api'
import type { Media, AnimeListParams } from '@/utils/types/anilist'
import { MediaSort, MediaSeason } from '@/utils/types/anilist'

const activeListRequests = new WeakMap<object, symbol>()

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

  // Detail records are serialized for SSR hydration and reused during SPA navigation
  animeDetailsById: Record<number, Media>
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
      hasNextPage: false,
      cache: {},
      animeDetailsById: {}
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
        // Season year logic:
        // - If currently Winter and selecting Summer/Fall: use previous year (Winter 2026 -> Summer 2025)
        // - If currently Fall and selecting Winter: use next year (Fall 2025 -> Winter 2026)
        // - Otherwise: use current year
        if (
          currentSeason === MediaSeason.WINTER &&
          (this.selectedSeason === MediaSeason.SUMMER || this.selectedSeason === MediaSeason.FALL)
        ) {
          params.seasonYear = year - 1
        } else if (
          this.selectedSeason === MediaSeason.WINTER &&
          currentSeason === MediaSeason.FALL
        ) {
          params.seasonYear = year + 1
        } else {
          params.seasonYear = year
        }
      }

      return params
    },

    // Load anime with current filters and sorting
    async loadAnime(resetData = false, { allowSeasonFallback = false } = {}) {
      const cacheKey = this.cacheKey
      const request = Symbol()
      activeListRequests.set(this, request)

      const ownsList = () => activeListRequests.get(this) === request
      const isCurrentRequest = () => ownsList() && this.cacheKey === cacheKey

      this.error = ''
      if (resetData) {
        const cached = this.cache[cacheKey]

        if (cached) {
          this.currentAnime = cached.data
          this.hasNextPage = cached.hasMore
          this.currentPage = cached.page
          this.loading = false
          this.loadingMore = false
          return
        }

        this.currentPage = 1
      }

      this.loading = resetData
      this.loadingMore = !resetData

      const params = this.getApiParams()
      const previousAnime = resetData ? [] : this.currentAnime

      try {
        const result = await getAnimeList(params)
        if (!isCurrentRequest()) return

        if (allowSeasonFallback && !params.search && !result.media?.length) {
          if (resetData && params.season && this.currentAnime.length === 0) {
            console.log(`No results for ${params.season} season, trying fallbacks...`)

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
              // Season year logic:
              // - If currently Winter and fallback is Summer/Fall: use previous year
              // - If currently Fall and fallback is Winter: use next year
              // - Otherwise: use current year
              let seasonYear = year
              if (
                currentSeason === MediaSeason.WINTER &&
                (fallbackSeason === MediaSeason.SUMMER || fallbackSeason === MediaSeason.FALL)
              ) {
                seasonYear = year - 1
              } else if (
                fallbackSeason === MediaSeason.WINTER &&
                currentSeason === MediaSeason.FALL
              ) {
                seasonYear = year + 1
              }

              const fallbackResult = await getAnimeList({
                ...params,
                season: fallbackSeason,
                seasonYear
              })
              if (!isCurrentRequest()) return

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
            const noSeasonParams = { ...params }
            delete noSeasonParams.season
            delete noSeasonParams.seasonYear
            const noSeasonResult = await getAnimeList(noSeasonParams)
            if (!isCurrentRequest()) return

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
        if (!isCurrentRequest()) return

        this.error = 'Failed to load anime data. Please try again.'
        this.hasNextPage = false
        console.error('Error loading anime data:', error)
        // Restore previous data on error if we had some
        if (resetData && previousAnime.length === 0) {
          this.currentAnime = []
        }
      } finally {
        if (ownsList()) {
          this.loading = false
          this.loadingMore = false
        }
      }
    },

    // Initial load - called when app starts
    async loadInitialData() {
      // Only load if we don't have any data yet
      if (this.currentAnime.length === 0 && !this.loading) {
        await this.loadAnime(true, { allowSeasonFallback: true })
      }
    },

    // Load next page of data
    async loadMoreData() {
      if (this.loading || this.loadingMore || !this.hasNextPage || this.error) return

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
      activeListRequests.delete(this)
      this.currentAnime = []
      this.loading = false
      this.loadingMore = false
      this.error = ''
      this.currentPage = 1
      this.totalAvailable = 0
      this.hasNextPage = false
      this.cache = {}
    },

    // Get anime by ID from current loaded data
    getAnimeById(id: number): Media | undefined {
      return this.currentAnime.find((anime) => anime.id === id)
    },

    // Load single anime details, reusing serialized SSR and navigation-prefetched data.
    async loadAnimeDetails(id: number): Promise<Media> {
      const cachedAnime = this.animeDetailsById[id]
      if (cachedAnime) {
        return cachedAnime
      }

      try {
        const anime = await getAnimeDetails(id)
        this.animeDetailsById[id] = anime
        return anime
      } catch (error) {
        console.error('Error loading anime details:', error)
        throw error
      }
    },

    // Remove a detail record before retrying a failed or stale request.
    invalidateAnimeDetails(id: number) {
      delete this.animeDetailsById[id]
    }
  }
})
