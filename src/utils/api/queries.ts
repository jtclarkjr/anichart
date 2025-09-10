import { gql } from '@apollo/client/core'

// Query for getting a list of anime with pagination
export const GET_ANIME_LIST = gql`
  query GetAnimeList(
    $page: Int = 1
    $perPage: Int = 20
    $sort: [MediaSort] = [POPULARITY_DESC]
    $search: String
    $genre: String
    $season: MediaSeason
    $seasonYear: Int
    $format: MediaFormat
    $status: MediaStatus
    $isAdult: Boolean
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        type: ANIME
        sort: $sort
        search: $search
        genre: $genre
        season: $season
        seasonYear: $seasonYear
        format: $format
        status: $status
        isAdult: $isAdult
      ) {
        id
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        startDate {
          year
          month
          day
        }
        season
        seasonYear
        format
        status
        episodes
        duration
        genres
        averageScore
        meanScore
        popularity
        favourites
        isAdult
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
        source
      }
    }
  }
`

// Query for getting detailed information about a specific anime
export const GET_ANIME_DETAILS = gql`
  query GetAnimeDetails($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description(asHtml: true)
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      season
      seasonYear
      format
      status
      episodes
      duration
      chapters
      volumes
      genres
      averageScore
      meanScore
      popularity
      favourites
      hashtag
      isAdult
      countryOfOrigin
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      studios {
        nodes {
          id
          name
        }
      }
      source
    }
  }
`

// Query for searching anime
export const SEARCH_ANIME = gql`
  query SearchAnime($search: String!, $page: Int = 1, $perPage: Int = 20, $isAdult: Boolean = false) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, search: $search, sort: [SEARCH_MATCH, POPULARITY_DESC], isAdult: $isAdult) {
        id
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        startDate {
          year
          month
          day
        }
        season
        seasonYear
        format
        status
        episodes
        averageScore
        popularity
        coverImage {
          large
          medium
          color
        }
        genres
      }
    }
  }
`

// Query for getting trending anime
export const GET_TRENDING_ANIME = gql`
  query GetTrendingAnime($page: Int = 1, $perPage: Int = 20, $isAdult: Boolean = false) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC], isAdult: $isAdult) {
        id
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        startDate {
          year
          month
          day
        }
        season
        seasonYear
        format
        status
        episodes
        averageScore
        popularity
        trending
        coverImage {
          large
          medium
          color
        }
        genres
      }
    }
  }
`

// Query for getting seasonal anime
export const GET_SEASONAL_ANIME = gql`
  query GetSeasonalAnime(
    $season: MediaSeason!
    $seasonYear: Int!
    $page: Int = 1
    $perPage: Int = 20
    $isAdult: Boolean = false
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC], isAdult: $isAdult) {
        id
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        startDate {
          year
          month
          day
        }
        season
        seasonYear
        format
        status
        episodes
        averageScore
        popularity
        coverImage {
          large
          medium
          color
        }
        genres
      }
    }
  }
`
