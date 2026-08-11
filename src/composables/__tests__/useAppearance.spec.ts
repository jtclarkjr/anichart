import { enableAutoUnmount, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  APPEARANCE_THEME_STORAGE_KEY,
  THEME_MODE_QUERY,
  THEME_MODE_STORAGE_KEY,
  useAppearance,
  type UseAppearanceResult
} from '../useAppearance'
import { createMediaQueryController, installMatchMedia } from '@/test-utils/matchMedia'

enableAutoUnmount(afterEach)

const mountAppearance = () => {
  let state: UseAppearanceResult | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        state = useAppearance()
        return {}
      },
      template: '<div />'
    })
  )

  if (!state) throw new Error('Appearance composable did not initialize')
  return { state, wrapper }
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.dataset.clvTheme = 'aqua'
  delete document.documentElement.dataset.clvThemeMode
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
  delete document.documentElement.dataset.clvTheme
  delete document.documentElement.dataset.clvThemeMode
})

describe('useAppearance', () => {
  it.each([
    { systemDark: false, expected: 'light' },
    { systemDark: true, expected: 'dark' }
  ] as const)(
    'defaults to Aqua while resolving the current $expected OS mode for Neutral',
    ({ systemDark, expected }) => {
      installMatchMedia(createMediaQueryController(THEME_MODE_QUERY, systemDark))

      const { state } = mountAppearance()

      expect(state.theme.value).toBe('aqua')
      expect(state.modePreference.value).toBe('system')
      expect(state.resolvedMode.value).toBe(expected)
      expect(document.documentElement.dataset.clvTheme).toBe('aqua')
      expect(document.documentElement.dataset.clvThemeMode).toBeUndefined()
    }
  )

  it('restores valid stored appearance values and ignores invalid values', () => {
    installMatchMedia(createMediaQueryController(THEME_MODE_QUERY, true))
    window.localStorage.setItem(APPEARANCE_THEME_STORAGE_KEY, 'neutral')
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, 'light')

    const explicit = mountAppearance()
    expect(explicit.state.theme.value).toBe('neutral')
    expect(explicit.state.modePreference.value).toBe('light')
    expect(explicit.state.resolvedMode.value).toBe('light')
    expect(document.documentElement.dataset.clvThemeMode).toBe('light')
    explicit.wrapper.unmount()

    window.localStorage.setItem(APPEARANCE_THEME_STORAGE_KEY, 'sepia')
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, 'twilight')

    const invalid = mountAppearance()
    expect(invalid.state.theme.value).toBe('aqua')
    expect(invalid.state.modePreference.value).toBe('system')
    expect(invalid.state.resolvedMode.value).toBe('dark')
    expect(document.documentElement.dataset.clvTheme).toBe('aqua')
    expect(document.documentElement.dataset.clvThemeMode).toBeUndefined()
  })

  it('persists the theme and remembers Neutral mode while Aqua is active', () => {
    installMatchMedia(createMediaQueryController(THEME_MODE_QUERY, false))
    const { state } = mountAppearance()

    state.setModePreference('dark')
    expect(window.localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.dataset.clvThemeMode).toBeUndefined()

    state.setTheme('neutral')
    expect(window.localStorage.getItem(APPEARANCE_THEME_STORAGE_KEY)).toBe('neutral')
    expect(document.documentElement.dataset.clvTheme).toBe('neutral')
    expect(document.documentElement.dataset.clvThemeMode).toBe('dark')

    state.setTheme('aqua')
    expect(window.localStorage.getItem(APPEARANCE_THEME_STORAGE_KEY)).toBe('aqua')
    expect(window.localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.dataset.clvThemeMode).toBeUndefined()

    state.setTheme('neutral')
    expect(state.modePreference.value).toBe('dark')
    expect(document.documentElement.dataset.clvThemeMode).toBe('dark')
  })

  it('reacts to OS changes only while Neutral System mode is active', () => {
    const controller = createMediaQueryController(THEME_MODE_QUERY, true)
    installMatchMedia(controller)
    const { state } = mountAppearance()

    state.setTheme('neutral')
    expect(document.documentElement.dataset.clvThemeMode).toBe('dark')

    controller.setMatches(false)
    expect(state.resolvedMode.value).toBe('light')
    expect(document.documentElement.dataset.clvThemeMode).toBe('light')

    state.setModePreference('dark')
    controller.setMatches(false)
    expect(state.resolvedMode.value).toBe('dark')

    state.setModePreference('system')
    expect(state.resolvedMode.value).toBe('light')

    state.setTheme('aqua')
    controller.setMatches(true)
    expect(document.documentElement.dataset.clvThemeMode).toBeUndefined()

    state.setTheme('neutral')
    expect(state.resolvedMode.value).toBe('dark')
    expect(document.documentElement.dataset.clvThemeMode).toBe('dark')
  })

  it('falls back safely when browser storage and matchMedia are unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable')
    })

    const { state } = mountAppearance()
    expect(state.theme.value).toBe('aqua')
    expect(state.modePreference.value).toBe('system')
    expect(state.resolvedMode.value).toBe('dark')
    expect(document.documentElement.dataset.clvThemeMode).toBeUndefined()

    expect(() => state.setTheme('neutral')).not.toThrow()
    expect(document.documentElement.dataset.clvThemeMode).toBe('dark')

    expect(() => state.setModePreference('light')).not.toThrow()
    expect(document.documentElement.dataset.clvThemeMode).toBe('light')
  })

  it('removes its media-query listener when the consumer unmounts', () => {
    const controller = createMediaQueryController(THEME_MODE_QUERY, false)
    installMatchMedia(controller)
    const { wrapper } = mountAppearance()

    expect(controller.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    wrapper.unmount()
    expect(controller.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
