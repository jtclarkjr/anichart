<template>
  <Button
    :as="RouterLink"
    to="/anime"
    class="back-to-list"
    variant="surface"
    size="sm"
    aria-label="Back to anime list"
  >
    <svg
      class="back-to-list__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
    <span>Back</span>
  </Button>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from './ui/Button.vue'
</script>

<style scoped lang="scss">
.back-to-list {
  position: fixed;
  top: calc(1rem + env(safe-area-inset-top));
  left: max(calc(1rem + env(safe-area-inset-left)), calc((100vw - 1200px) / 2));
  z-index: 200;
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  border-radius: 999px;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  @media (width <= 480px) {
    top: calc(0.75rem + env(safe-area-inset-top));
    left: calc(0.75rem + env(safe-area-inset-left));
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-to-list {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>
