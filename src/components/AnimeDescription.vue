<template>
  <section class="description-section">
    <h2>Description</h2>
    <div class="description" v-html="anime.description || 'No description available.'"></div>
  </section>
</template>

<script setup lang="ts">
import type { Media } from '@/utils/types/anilist'

interface Props {
  anime: Media
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.description-section {
  h2 {
    padding-bottom: 0.5rem;
    margin: 0 0 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    border-bottom: 2px solid var(--primary-color);
  }
}

.description {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-color);

  :deep(p) {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(br) {
    margin-bottom: 0.5rem;
  }

  :deep(i) {
    font-style: italic;
    color: var(--text-muted);
  }

  :deep(b),
  :deep(strong) {
    font-weight: 600;
    color: var(--primary-color);
  }

  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
