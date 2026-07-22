<template>
  <div id="app">
    <Suspense>
      <router-view v-slot="{ Component, route }">
        <transition :name="getTransitionName(route)" mode="out-in">
          <div :key="route.path" class="page-wrapper">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
      <template #fallback>
        <div class="app-loading">
          <Spinner class="app-loading__spinner" decorative size="xl" />
          <p>Loading...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import Spinner from '@/components/ui/Spinner.vue'
import type { RouteLocationNormalized } from 'vue-router'

// Determine transition type based on route
const getTransitionName = (route: RouteLocationNormalized): string => {
  // Smooth fade transition for detail pages
  if (route.path.startsWith('/anime/') && route.path !== '/anime') {
    return 'fade-slide'
  }
  // Default fade transition for other navigation
  return 'fade'
}
</script>

<style lang="scss">
#app {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.page-wrapper {
  width: 100%;
  min-height: 100vh;
}

// Transition animations
.fade-enter-active {
  transition: opacity 200ms ease;
}

.fade-leave-active {
  transition: opacity 150ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.fade-slide-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: var(--text-muted, #888);
  background: var(--bg-primary, #1a1a1a);

  &__spinner {
    margin-bottom: 1rem;
  }

  p {
    margin: 0;
    font-size: 1rem;
    opacity: 0.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none;
  }

  .fade-slide-enter-from,
  .fade-slide-leave-to {
    transform: none;
  }
}
</style>
