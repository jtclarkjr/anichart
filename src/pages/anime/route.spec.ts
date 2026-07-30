import { describe, expect, it } from 'vitest'
import { createAnimeDetailRouteProps } from './route'

describe('createAnimeDetailRouteProps', () => {
  it.each([
    ['1', 1],
    ['123456', 123456]
  ])('decodes the route parameter %s', (value, animeId) => {
    expect(createAnimeDetailRouteProps({ id: value })).toEqual({ animeId })
  })

  it.each([undefined, null, '', '0', '-1', '1.5', '12abc', '9007199254740992', ['1']])(
    'rejects an invalid route parameter',
    (value) => {
      expect(createAnimeDetailRouteProps({ id: value })).toEqual({ animeId: null })
    }
  )
})
