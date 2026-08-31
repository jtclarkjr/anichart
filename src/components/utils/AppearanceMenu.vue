<script setup lang="ts">
import type { ClvValue, DropdownMenuEntry } from '@jtclarkjr/component-library-vue'
import { computed } from 'vue'
import {
  useAppearance,
  type AppearanceTheme,
  type ThemeModePreference
} from '@/composables/useAppearance'

const THEME_GROUP_VALUE = 'appearance-theme'
const MODE_GROUP_VALUE = 'appearance-mode'

const { theme, modePreference, resolvedMode, setTheme, setModePreference } = useAppearance()

const appearanceItems = computed<DropdownMenuEntry[]>(() => {
  const items: DropdownMenuEntry[] = [
    {
      type: 'radio-group',
      value: THEME_GROUP_VALUE,
      label: 'Theme',
      selectedValue: theme.value,
      options: [
        { value: 'aqua', label: 'Aqua' },
        { value: 'neutral', label: 'Neutral' }
      ]
    }
  ]

  if (theme.value === 'neutral') {
    items.push(
      { type: 'separator', value: 'appearance-mode-separator' },
      {
        type: 'radio-group',
        value: MODE_GROUP_VALUE,
        label: 'Color mode',
        selectedValue: modePreference.value,
        options: [
          { value: 'system', label: 'System' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' }
        ]
      }
    )
  }

  return items
})

const isAppearanceTheme = (value: ClvValue): value is AppearanceTheme =>
  value === 'aqua' || value === 'neutral'

const isThemeModePreference = (value: ClvValue): value is ThemeModePreference =>
  value === 'system' || value === 'light' || value === 'dark'

const handleRadioChange = (entry: DropdownMenuEntry, value: ClvValue): void => {
  if (entry.value === THEME_GROUP_VALUE && isAppearanceTheme(value)) {
    setTheme(value)
    return
  }

  if (entry.value === MODE_GROUP_VALUE && isThemeModePreference(value)) {
    setModePreference(value)
  }
}

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

const buttonLabel = computed(() => {
  if (theme.value === 'aqua') return 'Appearance: Aqua. Open appearance settings.'

  if (modePreference.value === 'system') {
    return (
      'Appearance: Neutral, System (currently ' +
      titleCase(resolvedMode.value) +
      '). Open appearance settings.'
    )
  }

  return 'Appearance: Neutral, ' + titleCase(modePreference.value) + '. Open appearance settings.'
})
</script>

<template>
  <DropdownMenu
    :items="appearanceItems"
    align="end"
    side="bottom"
    @radio-change="handleRadioChange"
  >
    <template #trigger>
      <Button
        class="appearance-menu"
        variant="surface"
        size="icon"
        :aria-label="buttonLabel"
        :title="buttonLabel"
        :data-theme-preference="theme"
        :data-mode-preference="theme === 'neutral' ? modePreference : undefined"
      >
        <svg
          v-if="theme === 'aqua'"
          class="appearance-menu__icon"
          data-appearance-icon="aqua"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2.7 6.2 9.1a7 7 0 1 0 11.6 0L12 2.7Z" />
        </svg>
        <svg
          v-else-if="modePreference === 'system'"
          class="appearance-menu__icon"
          data-appearance-icon="neutral-system"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="12" x="3" y="4" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
        <svg
          v-else-if="modePreference === 'light'"
          class="appearance-menu__icon"
          data-appearance-icon="neutral-light"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
        <svg
          v-else
          class="appearance-menu__icon"
          data-appearance-icon="neutral-dark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
        </svg>
      </Button>
    </template>
  </DropdownMenu>
</template>

<style scoped lang="scss">
.appearance-menu {
  position: fixed;
  top: calc(1rem + env(safe-area-inset-top));
  right: max(calc(1rem + env(safe-area-inset-right)), calc((100vw - 1200px) / 2 - 4rem));
  z-index: 200;
  width: 3rem;
  min-width: 3rem;
  height: 3rem;
  min-height: 3rem;
  padding: 0;
  border-radius: var(--clv-radius-pill, 999px);

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media (width <= 480px) {
    top: calc(0.75rem + env(safe-area-inset-top));
    right: calc(0.75rem + env(safe-area-inset-right));
  }
}

@media (prefers-reduced-motion: reduce) {
  .appearance-menu {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>
