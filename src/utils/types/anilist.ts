export interface MediaTitle {
  romaji: string | null
  english: string | null
  native: string | null
}

export interface MediaCoverImage {
  extraLarge: string | null
  large: string | null
  medium: string | null
  color: string | null
}

export interface MediaDate {
  year: number | null
  month: number | null
  day: number | null
}

export interface Studio {
  id: number
  name: string
}

export interface StudioConnection {
  nodes: Studio[]
}

export interface GenreStats {
  count: number
  meanScore: number
  genre: string
}

export interface Media {
  id: number
  title: MediaTitle
  description: string | null
  startDate: MediaDate | null
  endDate: MediaDate | null
  season: MediaSeason | null
  seasonYear: number | null
  type: MediaType
  format: MediaFormat | null
  status: MediaStatus | null
  episodes: number | null
  duration: number | null
  chapters: number | null
  volumes: number | null
  genres: string[]
  averageScore: number | null
  meanScore: number | null
  popularity: number | null
  favourites: number | null
  hashtag: string | null
  isAdult: boolean
  countryOfOrigin: string | null
  coverImage: MediaCoverImage
  bannerImage: string | null
  studios: StudioConnection | null
  source: MediaSource | null
}

export interface Page {
  pageInfo: PageInfo
  media: Media[]
}

export interface PageInfo {
  total: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
  perPage: number
}

export enum MediaType {
  ANIME = 'ANIME',
  MANGA = 'MANGA'
}

export enum MediaFormat {
  TV = 'TV',
  TV_SHORT = 'TV_SHORT',
  MOVIE = 'MOVIE',
  SPECIAL = 'SPECIAL',
  OVA = 'OVA',
  ONA = 'ONA',
  MUSIC = 'MUSIC',
  MANGA = 'MANGA',
  NOVEL = 'NOVEL',
  ONE_SHOT = 'ONE_SHOT'
}

export enum MediaStatus {
  FINISHED = 'FINISHED',
  RELEASING = 'RELEASING',
  NOT_YET_RELEASED = 'NOT_YET_RELEASED',
  CANCELLED = 'CANCELLED',
  HIATUS = 'HIATUS'
}

export enum MediaSeason {
  WINTER = 'WINTER',
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  FALL = 'FALL'
}

export enum MediaSource {
  ORIGINAL = 'ORIGINAL',
  MANGA = 'MANGA',
  LIGHT_NOVEL = 'LIGHT_NOVEL',
  VISUAL_NOVEL = 'VISUAL_NOVEL',
  VIDEO_GAME = 'VIDEO_GAME',
  OTHER = 'OTHER',
  NOVEL = 'NOVEL',
  DOUJINSHI = 'DOUJINSHI',
  ANIME = 'ANIME',
  WEB_NOVEL = 'WEB_NOVEL',
  LIVE_ACTION = 'LIVE_ACTION',
  GAME = 'GAME',
  COMIC = 'COMIC',
  MULTIMEDIA_PROJECT = 'MULTIMEDIA_PROJECT',
  PICTURE_BOOK = 'PICTURE_BOOK'
}

export enum MediaSort {
  ID = 'ID',
  ID_DESC = 'ID_DESC',
  TITLE_ROMAJI = 'TITLE_ROMAJI',
  TITLE_ROMAJI_DESC = 'TITLE_ROMAJI_DESC',
  TITLE_ENGLISH = 'TITLE_ENGLISH',
  TITLE_ENGLISH_DESC = 'TITLE_ENGLISH_DESC',
  TITLE_NATIVE = 'TITLE_NATIVE',
  TITLE_NATIVE_DESC = 'TITLE_NATIVE_DESC',
  TYPE = 'TYPE',
  TYPE_DESC = 'TYPE_DESC',
  FORMAT = 'FORMAT',
  FORMAT_DESC = 'FORMAT_DESC',
  START_DATE = 'START_DATE',
  START_DATE_DESC = 'START_DATE_DESC',
  END_DATE = 'END_DATE',
  END_DATE_DESC = 'END_DATE_DESC',
  SCORE = 'SCORE',
  SCORE_DESC = 'SCORE_DESC',
  POPULARITY = 'POPULARITY',
  POPULARITY_DESC = 'POPULARITY_DESC',
  TRENDING = 'TRENDING',
  TRENDING_DESC = 'TRENDING_DESC',
  EPISODES = 'EPISODES',
  EPISODES_DESC = 'EPISODES_DESC',
  DURATION = 'DURATION',
  DURATION_DESC = 'DURATION_DESC',
  STATUS = 'STATUS',
  STATUS_DESC = 'STATUS_DESC',
  CHAPTERS = 'CHAPTERS',
  CHAPTERS_DESC = 'CHAPTERS_DESC',
  VOLUMES = 'VOLUMES',
  VOLUMES_DESC = 'VOLUMES_DESC',
  UPDATED_AT = 'UPDATED_AT',
  UPDATED_AT_DESC = 'UPDATED_AT_DESC',
  SEARCH_MATCH = 'SEARCH_MATCH',
  FAVOURITES = 'FAVOURITES',
  FAVOURITES_DESC = 'FAVOURITES_DESC'
}

// API Request/Response interfaces
export interface AnimeListParams {
  page?: number
  perPage?: number
  sort?: MediaSort[]
  search?: string
  genre?: string
  season?: MediaSeason
  seasonYear?: number
  format?: MediaFormat
  status?: MediaStatus
}

export interface AnimeListResponse {
  Page: Page
}

export interface AnimeDetailsResponse {
  Media: Media
}
