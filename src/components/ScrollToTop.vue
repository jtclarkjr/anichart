<template>
  <Transition name="scroll-to-top">
    <button
      v-if="isVisible"
      type="button"
      class="scroll-to-top"
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
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isVisible = ref(false)

const updateVisibility = () => {
  isVisible.value = window.scrollY >= window.innerHeight
}

const scrollToTop = () => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  })
}

onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', updateVisibility, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateVisibility)
})
</script>

<style scoped lang="scss">
.scroll-to-top {
  position: fixed;
  right: max(calc(1rem + env(safe-area-inset-right)), calc((100vw - 1200px) / 2 - 4rem));
  bottom: calc(1rem + env(safe-area-inset-bottom));
  z-index: 200;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  padding: 0;
  color: var(--text-primary);
  cursor: pointer;
  background: var(--surface-color);
  background: color-mix(in srgb, var(--surface-color) 88%, transparent);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgb(0 0 0 / 35%);
  backdrop-filter: blur(12px);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: white;
    background: color-mix(in srgb, var(--surface-color) 78%, var(--primary-color));
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--primary-color) 65%, transparent);
    outline-offset: 3px;
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
