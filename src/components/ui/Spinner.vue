<script setup lang="ts">
import { Spinner } from '@jtclarkjr/component-library-vue'
import type { SpinnerSize } from './types'

interface Props {
  label?: string
  size?: SpinnerSize
  decorative?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Loading',
  size: 'md',
  decorative: false
})

const librarySize = computed(() => (props.size === 'xl' ? 'lg' : props.size))
</script>

<template>
  <Spinner
    class="ui-spinner"
    :class="`ui-spinner--${size}`"
    :label="props.label"
    :size="librarySize"
    :decorative="props.decorative"
  />
</template>

<style scoped lang="scss">
.ui-spinner {
  display: inline-block;
  flex-shrink: 0;
  border: var(--ui-spinner-border, 3px) solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: ui-spinner-rotate 1s linear infinite;

  &--sm {
    width: 20px;
    height: 20px;
    --ui-spinner-border: 2px;
  }

  &--md {
    width: 32px;
    height: 32px;
    --ui-spinner-border: 2px;
  }

  &--lg {
    width: 40px;
    height: 40px;
  }

  &--xl {
    width: 48px;
    height: 48px;
  }
}

@keyframes ui-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-spinner {
    animation-duration: 2s;
  }
}
</style>
