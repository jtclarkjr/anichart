<template>
  <RouterLink to="/anime" class="back-to-list" aria-label="Back to anime list">
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
  </RouterLink>
</template>

<style scoped lang="scss">
.back-to-list {
  position: fixed;
  top: calc(1rem + env(safe-area-inset-top));
  left: max(calc(1rem + env(safe-area-inset-left)), calc((100vw - 1200px) / 2));
  z-index: 200;
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  color: var(--text-primary);
  text-decoration: none;
  background: var(--surface-color);
  background: color-mix(in srgb, var(--surface-color) 88%, transparent);
  border: 1px solid var(--border-color);
  border-radius: 999px;
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
    transform: translateY(-1px);
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
