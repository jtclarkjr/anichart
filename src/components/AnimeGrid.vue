<template>
  <div class="anime-grid-container">
    <!-- Consistent rendering for SSR/CSR hydration -->
    <div v-if="shouldShowLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading anime...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="shouldShowEmpty" class="empty">
      <p>No anime found</p>
    </div>

    <div v-else-if="shouldShowGrid" class="anime-grid">
      <AnimeCard
        v-for="item in anime"
        :key="item.id"
        :anime="item"
        @click="$emit('animeClick', $event)"
      />
    </div>

    <div v-if="hasMoreToShow" ref="loadTrigger" class="load-trigger">
      <div v-if="loadingMore" class="loading-more">
        <div class="loading-spinner small"></div>
        <p>Loading more anime...</p>
      </div>
      <div v-else class="showing-more">
        <p>Showing {{ anime.length }} of {{ totalCount }} anime</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AnimeCard from './AnimeCard.vue'
import type { Media } from '@/utils/types/anilist'

interface Props {
  anime: Media[]
  loading: boolean
  loadingMore?: boolean
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

const props = defineProps<Props>()
defineEmits<Emits>()
// Track if we're in SSR or post-hydration for consistent rendering
const isHydrated = ref(false)

// Load trigger ref for intersection observer
const loadTrigger = ref<HTMLElement | null>(null)

// Mark as hydrated after mount
onMounted(() => {
  isHydrated.value = true
})

// Computed properties for consistent SSR/CSR rendering
const shouldShowLoading = computed(() => {
  // During SSR or before hydration, only show loading if we actually need to load
  if (!isHydrated.value) {
    return props.loading && !props.hasData
  }
  // After hydration, show loading normally
  return props.loading && !props.hasData
})

const shouldShowEmpty = computed(() => {
  return !props.loading && !props.error && props.anime.length === 0 && isHydrated.value
})

const shouldShowGrid = computed(() => {
  // Always show grid if we have anime data, regardless of loading state
  // This prevents layout shift during hydration
  return props.anime.length > 0
})

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

.loading-more {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: var(--text-muted);

  .loading-spinner.small {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }
}

.showing-more {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>
