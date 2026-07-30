export interface AnimeDetailRouteProps {
  animeId: number | null
}

export const parseAnimeId = (value: unknown): number | null => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null
  }

  const animeId = Number(value)
  return Number.isSafeInteger(animeId) ? animeId : null
}

export const createAnimeDetailRouteProps = (
  params: Readonly<Record<string, unknown>>
): AnimeDetailRouteProps => ({
  animeId: parseAnimeId(params.id)
})
