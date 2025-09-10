<template>
  <div class="route-transition">
    <transition
      :name="transitionName"
      mode="out-in"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <slot />
    </transition>

    <!-- Loading overlay during transition -->
    <transition name="loading-fade">
      <div v-if="isTransitioning" class="transition-loading">
        <div class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  transitionName?: string
  showLoadingOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  transitionName: 'fade',
  showLoadingOverlay: false
})

const isTransitioning = ref(false)

const onBeforeEnter = () => {
  if (props.showLoadingOverlay) {
    isTransitioning.value = true
  }
}

const onEnter = (el: Element, done: () => void) => {
  // Add slight delay to ensure smooth animation
  nextTick(() => {
    done()
  })
}

const onLeave = () => {
  if (props.showLoadingOverlay) {
    isTransitioning.value = true
  }
}

const onAfterLeave = () => {
  // Keep loading indicator briefly to prevent flash
  if (props.showLoadingOverlay) {
    setTimeout(() => {
      isTransitioning.value = false
    }, 150)
  }
}
</script>

<style scoped lang="scss">
.route-transition {
  position: relative;
  width: 100%;
  min-height: inherit;
}

// Transition animations
.fade-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(1.02);
}

// Loading overlay
.transition-loading {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 30%);
  backdrop-filter: blur(2px);

  .loading-indicator {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 2rem;
    background: var(--surface-color);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgb(0 0 0 / 20%);

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-color);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
  }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
