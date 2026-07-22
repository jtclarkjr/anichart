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
          <Spinner class="client-only__spinner" decorative size="md" />
          <p>Loading...</p>
        </div>
      </slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import Spinner from '../ui/Spinner.vue'

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

  .client-only__spinner {
    margin-bottom: 1rem;
  }

  p {
    flex-shrink: 0;
    margin: 0;
    font-size: 0.9rem;
    text-align: center;
    opacity: 0.8;
  }
}
</style>
