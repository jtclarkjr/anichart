<template>
  <div class="anime-grid-container">
    <!-- Consistent rendering for SSR/CSR hydration -->
    <div v-if="shouldShowLoading" class="loading">
      <Spinner class="anime-grid__spinner" decorative size="lg" />
      <p>Loading anime...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <Button class="retry-btn" size="sm" @click="$emit('retry')">Retry</Button>
    </div>

    <div v-else-if="shouldShowEmpty" class="empty">
      <p>No anime found</p>
    </div>

    <TransitionGroup
      v-else-if="shouldShowGrid"
      name="anime-card"
      tag="div"
      class="anime-grid"
      appear
    >
      <AnimeCard
        v-for="(item, index) in anime"
        :key="item.id"
        :anime="item"
        :style="{ '--card-delay': getCardDelay(index) }"
        @click="$emit('animeClick', $event)"
      />
    </TransitionGroup>

    <div v-if="hasMoreToShow" ref="loadTrigger" class="load-trigger">
      <div v-if="loadingMore" class="loading-more">
        <Spinner decorative size="sm" />
        <p>Loading more anime...</p>
      </div>
      <div v-else class="showing-more">
        <p>Showing {{ anime.length }} of {{ totalCount }} anime</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AnimeCard from './AnimeCard.vue'
import Button from '../ui/Button.vue'
import Spinner from '../ui/Spinner.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
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
const emit = defineEmits<Emits>()
// Track if we're in SSR or post-hydration for consistent rendering
const isHydrated = ref(false)

// Load trigger ref for intersection observer
const loadTrigger = ref<HTMLElement | null>(null)
const batchStartIndex = ref(0)

const canLoadMore = computed(() => props.hasMoreToShow && !props.loading && !props.loadingMore)

useInfiniteScroll(loadTrigger, () => emit('loadMore'), {
  enabled: canLoadMore,
  rootMargin: '200px',
  threshold: 0.1,
  fallbackDistance: 200
})

const animeIds = computed(() => props.anime.map(({ id }) => id))

watch(animeIds, (nextIds, previousIds) => {
  const appendedToPreviousBatch =
    nextIds.length > previousIds.length && previousIds.every((id, index) => nextIds[index] === id)

  batchStartIndex.value = appendedToPreviousBatch ? previousIds.length : 0
})

const getCardDelay = (index: number): string => {
  const batchIndex = Math.max(index - batchStartIndex.value, 0)
  return `${Math.min(batchIndex, 10) * 40}ms`
}

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

  .anime-grid__spinner {
    margin-bottom: 1rem;
  }
}

.error {
  padding: 2rem;
  color: #ff6b6b;
  text-align: center;

  .retry-btn {
    margin-top: 1rem;
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
}

.showing-more {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}
</style>
