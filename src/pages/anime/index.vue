<template>
  <div class="anime-list">
    <div class="header">
      <div class="container">
        <h1>AniChart</h1>
        <SearchFilters
          v-model:searchQuery="searchQuery"
          v-model:selectedSort="selectedSort"
          v-model:selectedSeason="selectedSeason"
          @filterChange="handleFilterChange"
          @update:searchQuery="handleSearch"
        />
      </div>
    </div>

    <div class="container">
      <AnimeGrid
        ref="animeGridRef"
        :anime="animeStore.displayedAnime"
        :loading="animeStore.loading"
        :loadingMore="animeStore.loadingMore"
        :error="animeStore.error"
        :hasData="animeStore.currentAnime.length > 0"
        :hasMoreToShow="animeStore.hasMoreToShow"
        :totalCount="animeStore.currentCount"
        @animeClick="goToDetails"
        @retry="animeStore.loadInitialData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onServerPrefetch, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import SearchFilters from '@/components/SearchFilters.vue'
import AnimeGrid from '@/components/AnimeGrid.vue'
import { useAnimeStore } from '@/stores/anime'
import debounce from '@/utils/helpers/debounce'

const router = useRouter()
const animeStore = useAnimeStore()

// Navigation
const goToDetails = (id: number) => {
  router.push(`/anime/${id}`)
}

// Reactive refs for two-way binding
const searchQuery = computed({
  get: () => animeStore.searchQuery,
  set: (value: string) => animeStore.setSearchQuery(value)
})

const selectedSort = computed({
  get: () => animeStore.selectedSort,
  set: (value) => animeStore.setSort(value)
})

const selectedSeason = computed({
  get: () => animeStore.selectedSeason,
  set: (value) => animeStore.setSeason(value)
})

// Handle filter changes
const handleFilterChange = () => {
  // Filters are automatically applied through store getters
  // Just need to scroll to top (only on client)
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0)
  }
}

const handleSearch = debounce(() => {
  // Search is handled automatically through store
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0)
  }
}, 300)

// Reference to the AnimeGrid component
const animeGridRef = ref()
let observer: IntersectionObserver | null = null
let scrollListener: ((event: Event) => void) | null = null

const setupShowMore = () => {
  // Clean up any existing observer first
  cleanupObserver()
  
  const loadTrigger = animeGridRef.value?.loadTrigger
  if (!loadTrigger) {
    // If loadTrigger is not available yet, try again after a short delay
    setTimeout(() => {
      setupShowMore()
    }, 100)
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (
        entry?.isIntersecting &&
        animeStore.hasMoreToShow &&
        !animeStore.loading &&
        !animeStore.loadingMore
      ) {
        animeStore.loadMoreData()
      }
    },
    {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    }
  )

  observer.observe(loadTrigger)
  
  // Add a fallback scroll listener in case intersection observer has issues
  setupScrollFallback()
}

const setupScrollFallback = () => {
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener)
  }
  
  scrollListener = () => {
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const clientHeight = document.documentElement.clientHeight
    
    // Trigger load more when within 200px of bottom
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (
        animeStore.hasMoreToShow &&
        !animeStore.loading &&
        !animeStore.loadingMore
      ) {
        animeStore.loadMoreData()
      }
    }
  }
  
  window.addEventListener('scroll', scrollListener, { passive: true })
}

const cleanupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener)
    scrollListener = null
  }
}

// SSR Prefetch - runs on server during SSR
onServerPrefetch(async () => {
  // Load anime data during SSR
  await animeStore.loadInitialData()
})

// Initialize on client
onMounted(async () => {
  await nextTick()

  // Load anime data if not already loaded (client-side fallback)
  if (animeStore.currentAnime.length === 0) {
    await animeStore.loadInitialData()
  }

  // Setup show more after data is loaded and DOM is ready
  // Use multiple nextTick calls to ensure the AnimeGrid component is fully rendered
  await nextTick()
  await nextTick()
  setupShowMore()
})

// Clear cache on navigation to ensure fresh data
onBeforeRouteLeave(() => {
  // Don't clear cache when navigating to detail pages
  const currentRoute = router.currentRoute.value
  if (!currentRoute.path.startsWith('/anime/')) {
    animeStore.cache = {}
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanupObserver()
})
</script>

<style scoped lang="scss">
.anime-list {
  min-height: 100vh;
  background: var(--background-color);
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1.5rem 0;
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    text-align: center;

    @media (width >= 768px) {
      margin-bottom: 1rem;
      text-align: left;
    }
  }
}

.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  margin: 0 auto;
}
</style>
