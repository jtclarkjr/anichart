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
        :anime="animeStore.displayedAnime"
        :loading="animeStore.loading"
        :loadingMore="animeStore.loadingMore"
        :error="animeStore.error"
        :hasData="animeStore.currentAnime.length > 0"
        :hasMoreToShow="animeStore.hasMoreToShow"
        :totalCount="animeStore.currentCount"
        @animeClick="goToDetails"
        @retry="animeStore.loadInitialData"
        @loadMore="animeStore.loadMoreData"
      />
    </div>

    <ScrollToTop />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onServerPrefetch } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import SearchFilters from '@/components/SearchFilters.vue'
import AnimeGrid from '@/components/AnimeGrid.vue'
import ScrollToTop from '@/components/ScrollToTop.vue'
import { useAnimeStore } from '@/stores/anime'
import debounce from '@/utils/helpers/debounce'

const router = useRouter()
const animeStore = useAnimeStore()

// Keep the populated list visible until the detail record is ready for the destination.
const goToDetails = async (id: number) => {
  try {
    await animeStore.loadAnimeDetails(id)
  } catch (error) {
    console.error('Failed to prefetch anime details:', error)
  }

  await router.push(`/anime/${id}`)
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

// SSR Prefetch - runs on server during SSR
onServerPrefetch(async () => {
  // Load anime data during SSR
  await animeStore.loadInitialData()
})

// Initialize on client
onMounted(async () => {
  // Load anime data if not already loaded (client-side fallback)
  if (animeStore.currentAnime.length === 0) {
    await animeStore.loadInitialData()
  }
})

// Clear cache on navigation to ensure fresh data
onBeforeRouteLeave(() => {
  // Don't clear cache when navigating to detail pages
  const currentRoute = router.currentRoute.value
  if (!currentRoute.path.startsWith('/anime/')) {
    animeStore.cache = {}
  }
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
