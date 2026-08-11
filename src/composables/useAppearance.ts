import type { ClvThemeMode } from '@jtclarkjr/component-library-vue'
import { onBeforeUnmount, onMounted, readonly, ref, type Ref } from 'vue'

export const APPEARANCE_THEME_STORAGE_KEY = 'anichart.theme'
export const THEME_MODE_STORAGE_KEY = 'anichart.theme-mode'
export const THEME_MODE_QUERY = '(prefers-color-scheme: dark)'

export type AppearanceTheme = 'aqua' | 'neutral'
export type ThemeModePreference = 'system' | ClvThemeMode

export interface UseAppearanceResult {
  theme: Readonly<Ref<AppearanceTheme>>
  modePreference: Readonly<Ref<ThemeModePreference>>
  resolvedMode: Readonly<Ref<ClvThemeMode>>
  setTheme: (theme: AppearanceTheme) => void
  setModePreference: (preference: ThemeModePreference) => void
}

const isAppearanceTheme = (value: string | null): value is AppearanceTheme =>
  value === 'aqua' || value === 'neutral'

const isThemeModePreference = (value: string | null): value is ThemeModePreference =>
  value === 'system' || value === 'light' || value === 'dark'

const readStoredTheme = (): AppearanceTheme => {
  if (typeof window === 'undefined') return 'aqua'

  try {
    const storedTheme = window.localStorage.getItem(APPEARANCE_THEME_STORAGE_KEY)
    return isAppearanceTheme(storedTheme) ? storedTheme : 'aqua'
  } catch {
    return 'aqua'
  }
}

const readStoredModePreference = (): ThemeModePreference => {
  if (typeof window === 'undefined') return 'system'

  try {
    const storedPreference = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)
    return isThemeModePreference(storedPreference) ? storedPreference : 'system'
  } catch {
    return 'system'
  }
}

const writeStoredValue = (key: string, value: string): void => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Keep the in-memory appearance reactive when storage is unavailable.
  }
}

const getSystemMode = (colorScheme: MediaQueryList | undefined): ClvThemeMode => {
  if (!colorScheme) return 'dark'
  return colorScheme.matches ? 'dark' : 'light'
}

export const useAppearance = (): UseAppearanceResult => {
  const theme = ref<AppearanceTheme>('aqua')
  const modePreference = ref<ThemeModePreference>('system')
  const resolvedMode = ref<ClvThemeMode>('dark')
  let colorScheme: MediaQueryList | undefined

  const applyAppearance = (): void => {
    resolvedMode.value =
      modePreference.value === 'system' ? getSystemMode(colorScheme) : modePreference.value

    if (typeof document === 'undefined') return

    document.documentElement.dataset.clvTheme = theme.value

    if (theme.value === 'neutral') {
      document.documentElement.dataset.clvThemeMode = resolvedMode.value
      return
    }

    delete document.documentElement.dataset.clvThemeMode
  }

  const setTheme = (nextTheme: AppearanceTheme): void => {
    theme.value = nextTheme
    writeStoredValue(APPEARANCE_THEME_STORAGE_KEY, nextTheme)
    applyAppearance()
  }

  const setModePreference = (nextPreference: ThemeModePreference): void => {
    modePreference.value = nextPreference
    writeStoredValue(THEME_MODE_STORAGE_KEY, nextPreference)
    applyAppearance()
  }

  const handleSystemModeChange = (): void => {
    if (theme.value === 'neutral' && modePreference.value === 'system') applyAppearance()
  }

  onMounted(() => {
    colorScheme =
      typeof window.matchMedia === 'function' ? window.matchMedia(THEME_MODE_QUERY) : undefined
    theme.value = readStoredTheme()
    modePreference.value = readStoredModePreference()
    applyAppearance()
    colorScheme?.addEventListener('change', handleSystemModeChange)
  })

  onBeforeUnmount(() => {
    colorScheme?.removeEventListener('change', handleSystemModeChange)
  })

  return {
    theme: readonly(theme),
    modePreference: readonly(modePreference),
    resolvedMode: readonly(resolvedMode),
    setTheme,
    setModePreference
  }
}
