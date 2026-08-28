import { enableAutoUnmount, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import {
  DropdownMenu,
  type ClvValue,
  type DropdownMenuEntry
} from '@jtclarkjr/component-library-vue'
import AppearanceMenu from '../utils/AppearanceMenu.vue'
import {
  APPEARANCE_THEME_STORAGE_KEY,
  THEME_MODE_QUERY,
  THEME_MODE_STORAGE_KEY
} from '@/composables/useAppearance'
import { createMediaQueryController, installMatchMedia } from '@/test-utils/matchMedia'

enableAutoUnmount(afterEach)

const getRadioGroup = (wrapper: VueWrapper, value: string): DropdownMenuEntry => {
  const items = wrapper.getComponent(DropdownMenu).props('items')
  const entry = items.find((item) => item.type === 'radio-group' && item.value === value)

  if (!entry) throw new Error(`Missing ${value} radio group`)
  return entry
}

const selectRadioValue = async (
  wrapper: VueWrapper,
  groupValue: string,
  value: ClvValue
): Promise<void> => {
  wrapper
    .getComponent(DropdownMenu)
    .vm.$emit('radioChange', getRadioGroup(wrapper, groupValue), value)
  await nextTick()
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.dataset.clvTheme = 'aqua'
  delete document.documentElement.dataset.clvThemeMode
  installMatchMedia(createMediaQueryController(THEME_MODE_QUERY, false))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
  delete document.documentElement.dataset.clvTheme
  delete document.documentElement.dataset.clvThemeMode
})

describe('AppearanceMenu', () => {
  it('shows modes only for Neutral and persists every appearance choice accessibly', async () => {
    const wrapper = mount(AppearanceMenu)
    await nextTick()
    const button = wrapper.get('button')

    expect(button.attributes('data-theme-preference')).toBe('aqua')
    expect(button.attributes('data-mode-preference')).toBeUndefined()
    expect(button.attributes('aria-label')).toBe('Appearance: Aqua. Open appearance settings.')
    expect(button.find('[data-appearance-icon="aqua"]').exists()).toBe(true)
    expect(wrapper.getComponent(DropdownMenu).props('items')).toHaveLength(1)
    expect(getRadioGroup(wrapper, 'appearance-theme')).toMatchObject({
      selectedValue: 'aqua',
      label: 'Theme'
    })

    await selectRadioValue(wrapper, 'appearance-theme', 'neutral')

    expect(button.attributes('data-theme-preference')).toBe('neutral')
    expect(button.attributes('data-mode-preference')).toBe('system')
    expect(button.attributes('aria-label')).toBe(
      'Appearance: Neutral, System (currently Light). Open appearance settings.'
    )
    expect(button.find('[data-appearance-icon="neutral-system"]').exists()).toBe(true)
    expect(window.localStorage.getItem(APPEARANCE_THEME_STORAGE_KEY)).toBe('neutral')
    expect(document.documentElement.dataset.clvTheme).toBe('neutral')
    expect(document.documentElement.dataset.clvThemeMode).toBe('light')
    expect(getRadioGroup(wrapper, 'appearance-mode')).toMatchObject({
      selectedValue: 'system',
      label: 'Color mode'
    })

    await selectRadioValue(wrapper, 'appearance-mode', 'dark')

    expect(button.attributes('data-mode-preference')).toBe('dark')
    expect(button.attributes('aria-label')).toBe(
      'Appearance: Neutral, Dark. Open appearance settings.'
    )
    expect(button.find('[data-appearance-icon="neutral-dark"]').exists()).toBe(true)
    expect(window.localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.dataset.clvThemeMode).toBe('dark')

    await selectRadioValue(wrapper, 'appearance-theme', 'aqua')

    expect(button.attributes('data-theme-preference')).toBe('aqua')
    expect(button.attributes('data-mode-preference')).toBeUndefined()
    expect(document.documentElement.dataset.clvThemeMode).toBeUndefined()
    expect(window.localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('dark')
    expect(wrapper.getComponent(DropdownMenu).props('items')).toHaveLength(1)

    await selectRadioValue(wrapper, 'appearance-theme', 'neutral')

    expect(button.attributes('data-mode-preference')).toBe('dark')
    expect(document.documentElement.dataset.clvThemeMode).toBe('dark')
  })
})
