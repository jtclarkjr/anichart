import { apolloClient } from '@/plugins/apollo'
import type { DocumentNode } from '@apollo/client'
import {
  GET_ANIME_LIST,
  GET_ANIME_DETAILS,
  SEARCH_ANIME,
  GET_TRENDING_ANIME,
  GET_SEASONAL_ANIME
} from './queries'
import type {
  Media,
  Page,
  AnimeListParams,
  AnimeListResponse,
  AnimeDetailsResponse
} from '@/utils/types/anilist'
import { MediaSeason, MediaStatus } from '@/utils/types/anilist'

// Helper function to handle GraphQL queries with consistent error handling
const executeQuery = async <T>(
  query: DocumentNode,
  variables: Record<string, unknown> | AnimeListParams,
  errorMessage: string
): Promise<T> => {
  try {
    const { data } = await apolloClient.query<T>({
      query,
      variables,
      fetchPolicy: 'cache-first'
    })
    if (!data) {
      throw new Error('No data returned from GraphQL query')
    }
    return data
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    // Log more details about the error for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        variables,
        query: query.loc?.source?.body?.slice(0, 200) // First 200 chars of query
      })
    }
    throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to extract Page data with validation
const extractPageData = (data: AnimeListResponse | undefined): Page => {
  if (!data?.Page) {
    throw new Error('No data received from API')
  }
  return data.Page
}

// Helper function to extract Media data with validation
const extractMediaData = (data: AnimeDetailsResponse | undefined): Media => {
  if (!data?.Media) {
    throw new Error('No anime data received from API')
  }
  return data.Media
}

/**
 * Get a list of anime with optional filtering and pagination
 */
export const getAnimeList = async (params: AnimeListParams = {}): Promise<Page> => {
  const data = await executeQuery<AnimeListResponse>(
    GET_ANIME_LIST,
    params,
    'Failed to fetch anime list'
  )
  return extractPageData(data)
}

/**
 * Get detailed information about a specific anime
 */
export const getAnimeDetails = async (id: number): Promise<Media> => {
  const data = await executeQuery<AnimeDetailsResponse>(
    GET_ANIME_DETAILS,
    { id },
    'Failed to fetch anime details'
  )
  return extractMediaData(data)
}

/**
 * Search for anime by title
 */
export const searchAnime = async (
  search: string,
  page: number = 1,
  perPage: number = 20
): Promise<Page> => {
  const data = await executeQuery<AnimeListResponse>(
    SEARCH_ANIME,
    { search, page, perPage, isAdult: false },
    'Failed to search anime'
  )
  return extractPageData(data)
}

/**
 * Get trending anime
 */
export const getTrendingAnime = async (page: number = 1, perPage: number = 20): Promise<Page> => {
  const data = await executeQuery<AnimeListResponse>(
    GET_TRENDING_ANIME,
    { page, perPage, isAdult: false },
    'Failed to fetch trending anime'
  )
  return extractPageData(data)
}

/**
 * Get seasonal anime
 */
export const getSeasonalAnime = async (
  season: MediaSeason,
  seasonYear: number,
  page: number = 1,
  perPage: number = 20
): Promise<Page> => {
  const data = await executeQuery<AnimeListResponse>(
    GET_SEASONAL_ANIME,
    { season, seasonYear, page, perPage, isAdult: false },
    'Failed to fetch seasonal anime'
  )
  return extractPageData(data)
}

/**
 * Get current season and year
 */
export const getCurrentSeason = (): { season: MediaSeason; year: number } => {
  const now = new Date()
  const month = now.getMonth() + 1 // getMonth() returns 0-11
  const year = now.getFullYear()

  let season: MediaSeason
  if (month >= 12 || month <= 2) {
    season = MediaSeason.WINTER
  } else if (month >= 3 && month <= 5) {
    season = MediaSeason.SPRING
  } else if (month >= 6 && month <= 8) {
    season = MediaSeason.SUMMER
  } else {
    season = MediaSeason.FALL
  }

  return { season, year }
}

/**
 * Get the display title for an anime (prefer English, fallback to Romaji)
 */
export const getDisplayTitle = (title: {
  romaji: string | null
  english: string | null
  native: string | null
}): string => {
  return title.english || title.romaji || title.native || 'Unknown Title'
}

/**
 * Get a safe image URL that handles null values properly
 */
export const getSafeImageUrl = (coverImage: {
  extraLarge: string | null
  large: string | null
  medium: string | null
}): string | undefined => {
  return coverImage.extraLarge || coverImage.large || coverImage.medium || undefined
}

/**
 * Format anime score for display
 */
export const formatScore = (score: number | null): string => {
  if (!score) return 'N/A'
  return `${score}%`
}

/**
 * Format anime year for display
 */
export const formatYear = (
  startDate: { year: number | null; month: number | null; day: number | null } | null
): string => {
  if (!startDate?.year) return 'TBA'
  return startDate.year.toString()
}

/**
 * Format anime status for display
 */
export const formatStatus = (status: MediaStatus | null): string => {
  if (!status) return 'Unknown'

  switch (status) {
    case MediaStatus.FINISHED:
      return 'Completed'
    case MediaStatus.RELEASING:
      return 'Airing'
    case MediaStatus.NOT_YET_RELEASED:
      return 'Upcoming'
    case MediaStatus.CANCELLED:
      return 'Cancelled'
    case MediaStatus.HIATUS:
      return 'Hiatus'
    default:
      return status
  }
}

// For backward compatibility, export all functions as AnimeApi object
export const AnimeApi = {
  getAnimeList,
  getAnimeDetails,
  searchAnime,
  getTrendingAnime,
  getSeasonalAnime,
  getCurrentSeason,
  getDisplayTitle,
  getSafeImageUrl,
  formatScore,
  formatYear,
  formatStatus
}
