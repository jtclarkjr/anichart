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
        :error="animeStore.error"
        :hasData="animeStore.isDataLoaded"
        :hasMoreToShow="animeStore.hasMoreToShow"
        :totalCount="animeStore.filteredCount"
        @animeClick="goToDetails"
        @retry="animeStore.loadAllAnime"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
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
  // Just need to scroll to top
  window.scrollTo(0, 0)
}

const handleSearch = debounce(() => {
  // Search is handled automatically through store
  window.scrollTo(0, 0)
}, 300)

// Reference to the AnimeGrid component
const animeGridRef = ref()
let observer: IntersectionObserver | null = null

const setupShowMore = () => {
  const loadTrigger = animeGridRef.value?.loadTrigger
  if (!loadTrigger) return

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && animeStore.hasMoreToShow && !animeStore.loading) {
        animeStore.showMoreItems()
      }
    },
    {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    }
  )

  observer.observe(loadTrigger)
}

const cleanupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

// Initialize
onMounted(async () => {
  // Load anime data if not already loaded
  await animeStore.loadAllAnime()

  // Setup show more after data is loaded
  nextTick(() => {
    setupShowMore()
  })
})

// Cleanup on unmount
onUnmounted(() => {
  cleanupObserver()
})
</script>

<style scoped lang="scss">
.anime-list {
  min-height: 100vh;
  background: var(--bg-primary);
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1.5rem 0;
  background: var(--bg-secondary);
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
