<template>
  <div class="anime-grid-container">
    <div v-if="loading && !hasData" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading anime...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="!loading && !error && anime.length === 0" class="empty">
      <p>No anime found</p>
    </div>

    <div v-else-if="!loading && !error && anime.length > 0" class="anime-grid">
      <AnimeCard
        v-for="item in anime"
        :key="item.id"
        :anime="item"
        @click="$emit('animeClick', $event)"
      />
    </div>

    <div v-if="hasMoreToShow" ref="loadTrigger" class="load-trigger">
      <div class="showing-more">
        <p>Showing {{ anime.length }} of {{ totalCount }} anime</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimeCard from './AnimeCard.vue'
import type { Media } from '@/utils/types/anilist'

interface Props {
  anime: Media[]
  loading: boolean
  error: string
  hasData: boolean
  hasMoreToShow: boolean
  totalCount: number
}

interface Emits {
  animeClick: [id: number]
  retry: []
  loadMore: []
}

defineProps<Props>()
defineEmits<Emits>()

// Load trigger ref for intersection observer
const loadTrigger = ref<HTMLElement | null>(null)

// Expose loadTrigger for parent component to setup intersection observer
defineExpose({
  loadTrigger
})
</script>

<style scoped lang="scss">
.anime-grid-container {
  width: 100%;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-muted);

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin-bottom: 1rem;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
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

.error {
  padding: 2rem;
  color: #ff6b6b;
  text-align: center;

  .retry-btn {
    padding: 8px 16px;
    margin-top: 1rem;
    color: white;
    cursor: pointer;
    background: var(--primary-color);
    border: none;
    border-radius: 6px;
    transition: background-color 0.2s ease;

    &:hover {
      background: color-mix(in srgb, var(--primary-color) 80%, black);
    }
  }
}

.empty {
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--text-muted);
  text-align: center;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  padding: 1rem 0;

  @media (width >= 480px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.5rem;
  }

  @media (width >= 640px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }

  @media (width >= 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
  }

  @media (width >= 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

.load-trigger {
  padding: 2rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  text-align: center;
}

.showing-more {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>
