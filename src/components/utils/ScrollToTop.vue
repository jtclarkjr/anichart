<template>
  <Transition name="scroll-to-top">
    <Button
      v-if="isVisible"
      class="scroll-to-top"
      variant="surface"
      size="icon"
      aria-label="Scroll to top"
      @click="scrollToTop"
    >
      <svg
        class="scroll-to-top__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </Button>
  </Transition>
</template>

<script setup lang="ts">
import Button from '../ui/Button.vue'
import { useScrollToTop } from '@/composables/useScrollToTop'

const { isVisible, scrollToTop } = useScrollToTop()
</script>

<style scoped lang="scss">
.scroll-to-top {
  position: fixed;
  right: max(calc(1rem + env(safe-area-inset-right)), calc((100vw - 1200px) / 2 - 4rem));
  bottom: calc(1rem + env(safe-area-inset-bottom));
  z-index: 200;
  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  @media (width <= 480px) {
    right: calc(0.75rem + env(safe-area-inset-right));
    bottom: calc(0.75rem + env(safe-area-inset-bottom));
  }
}

.scroll-to-top-enter-active,
.scroll-to-top-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.scroll-to-top-enter-from,
.scroll-to-top-leave-to {
  opacity: 0;
  transform: translateY(0.5rem) scale(0.9);
}

@media (prefers-reduced-motion: reduce) {
  .scroll-to-top,
  .scroll-to-top-enter-active,
  .scroll-to-top-leave-active {
    transition: none;
  }

  .scroll-to-top:hover,
  .scroll-to-top-enter-from,
  .scroll-to-top-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
