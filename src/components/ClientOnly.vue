<template>
  <!-- Always render the same root element to prevent hydration mismatch -->
  <div class="client-only-wrapper">
    <template v-if="isMounted">
      <slot />
    </template>
    <template v-else>
      <slot name="fallback">
        <!-- Default fallback content -->
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </slot>
    </template>
  </div>
</template>

<script setup lang="ts">
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>

<style scoped lang="scss">
.client-only-wrapper {
  width: 100%;
  height: 100%;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: var(--text-muted);

  .loading-spinner {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    margin-bottom: 1rem;
    border: 2px solid var(--border-color);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    flex-shrink: 0;
    margin: 0;
    font-size: 0.9rem;
    text-align: center;
    opacity: 0.8;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
