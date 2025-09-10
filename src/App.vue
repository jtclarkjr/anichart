<template>
  <div id="app">
    <Suspense>
      <router-view v-slot="{ Component, route }">
        <transition
          :name="getTransitionName(route)"
          mode="out-in"
          @enter="onEnter"
          @leave="onLeave"
        >
          <div :key="route.path" class="page-wrapper">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
      <template #fallback>
        <div class="app-loading">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
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

// Transition event handlers
const onEnter = (el: Element) => {
  // Ensure smooth entry
  if (el instanceof HTMLElement) {
    el.style.opacity = '0'
    el.style.transform = 'translateY(10px)'
    void el.offsetHeight // Force reflow
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }
}

const onLeave = (el: Element) => {
  // Ensure smooth exit
  if (el instanceof HTMLElement) {
    el.style.transition = 'opacity 0.15s ease, transform 0.15s ease'
    el.style.opacity = '0'
    el.style.transform = 'translateY(-5px)'
  }
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(1.02);
}

// Ensure smooth transitions on route change
.fade-slide-enter-active .anime-details,
.fade-slide-enter-active .anime-list {
  will-change: transform, opacity;
}

// Loading state improvements
.route-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary, #1a1a1a);

  .loading-content {
    color: var(--text-muted, #888);
    text-align: center;
  }
}

.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: var(--text-muted, #888);
  background: var(--bg-primary, #1a1a1a);

  .loading-spinner {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    border: 3px solid var(--border-color, #333);
    border-top: 3px solid var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: app-spin 1s linear infinite;
  }

  p {
    margin: 0;
    font-size: 1rem;
    opacity: 0.8;
  }

  @keyframes app-spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}

// Global loading state for route transitions
body.route-loading {
  &::before {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10000;
    height: 3px;
    content: '';
    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
    animation: loading-bar 1s ease-in-out infinite alternate;
  }

  // Slightly reduce opacity during navigation
  #app {
    opacity: 0.98;
    transition: opacity 0.2s ease;
  }
}

@keyframes loading-bar {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateX(100vw);
  }
}
</style>
