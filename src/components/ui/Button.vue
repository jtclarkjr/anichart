<script setup lang="ts">
import Spinner from './Spinner.vue'
import type { ButtonAs, ButtonSize, ButtonVariant } from './types'

interface Props {
  as?: ButtonAs
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button'
})

const isNativeButton = computed(() => props.as === 'button')
const isUnavailable = computed(() => props.disabled || props.loading)

const handleClick = (event: MouseEvent) => {
  if (!isUnavailable.value) return

  event.preventDefault()
  event.stopImmediatePropagation()
}
</script>

<template>
  <component
    :is="as"
    class="ui-button"
    :class="[`ui-button--${variant}`, `ui-button--${size}`]"
    :type="isNativeButton ? type : undefined"
    :disabled="isNativeButton ? isUnavailable : undefined"
    :aria-disabled="!isNativeButton && isUnavailable ? 'true' : undefined"
    :aria-busy="loading || undefined"
    :tabindex="!isNativeButton && isUnavailable ? -1 : undefined"
    @click="handleClick"
  >
    <Spinner v-if="loading" decorative size="sm" />
    <slot />
  </component>
</template>

<style scoped lang="scss">
.ui-button {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  font: inherit;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 6px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--primary-color) 65%, transparent);
    outline-offset: 3px;
  }

  &:disabled,
  &[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &--sm {
    min-height: 2rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.82rem;
  }

  &--md {
    min-height: 2.65rem;
    padding: 0.7rem 1rem;
  }

  &--lg {
    min-height: 3.2rem;
    padding: 0.9rem 1.3rem;
    font-size: 1.08rem;
  }

  &--icon {
    width: 3rem;
    height: 3rem;
    padding: 0;
    border-radius: 50%;
  }

  &--primary {
    color: #06231b;
    background: var(--primary-color);

    &:not(:disabled, [aria-disabled='true']):hover {
      background: color-mix(in srgb, var(--primary-color) 80%, black);
    }
  }

  &--surface {
    color: var(--text-primary);
    background: var(--surface-color);
    background: color-mix(in srgb, var(--surface-color) 88%, transparent);
    border-color: var(--border-color);
    box-shadow: 0 4px 16px rgb(0 0 0 / 35%);
    backdrop-filter: blur(12px);

    &:not([aria-disabled='true']):hover {
      color: white;
      background: color-mix(in srgb, var(--surface-color) 78%, var(--primary-color));
      border-color: var(--primary-color);
    }
  }

  &--ghost {
    color: var(--text-muted);
    background: transparent;

    &:not(:disabled, [aria-disabled='true']):hover {
      color: var(--text-primary);
      background: var(--border-color);
    }
  }

  &--danger {
    color: #2c0710;
    background: var(--error-color);

    &:not(:disabled, [aria-disabled='true']):hover {
      background: color-mix(in srgb, var(--error-color) 80%, black);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-button {
    transition: none;
  }
}
</style>
