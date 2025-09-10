<template>
  <div class="anime-details">
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="() => loadAnimeDetails()" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="anime" class="details-content">
      <!-- Banner Section -->
      <AnimeBanner :anime="anime" />

      <!-- Main Content -->
      <div class="container">
        <div class="content-grid">
          <div class="main-content">
            <AnimeDescription :anime="anime" />
          </div>

          <div class="sidebar">
            <AnimeMetadata :anime="anime" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="isLoading || (!anime && !error)" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading anime details...</p>
    </div>

    <!-- Empty state for when no data and no error (shouldn't happen with proper routing) -->
    <div v-else class="error">
      <p>Anime not found</p>
      <button @click="() => $router.push('/anime')" class="retry-btn">Back to Anime List</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimeBanner from '@/components/AnimeBanner.vue'
import AnimeDescription from '@/components/AnimeDescription.vue'
import AnimeMetadata from '@/components/AnimeMetadata.vue'
import { useAnimeStore } from '@/stores/anime'
import type { Media } from '@/utils/types/anilist'

const route = useRoute()
const animeStore = useAnimeStore()

// Reactive data - initialize consistently for SSR
const anime = ref<Media | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(false)

// Data loading with better error handling
const loadAnimeDetails = async (): Promise<Media | null> => {
  const id = (route.params as { id?: string }).id
  if (!id || typeof id !== 'string') {
    error.value = 'Invalid anime ID'
    return null
  }

  const animeId = parseInt(id)
  if (isNaN(animeId)) {
    error.value = 'Invalid anime ID'
    return null
  }

  // Don't reload if we already have the right data
  if (anime.value && anime.value.id === animeId && !error.value) {
    return anime.value
  }

  isLoading.value = true
  error.value = null

  try {
    const result = await animeStore.loadAnimeDetails(animeId)
    anime.value = result
    return result
  } catch (err) {
    error.value = 'Failed to load anime details. Please try again.'
    console.error('Error loading anime details:', err)
    return null
  } finally {
    isLoading.value = false
  }
}

// Initialize data loading - non-blocking for better SSR/client coordination
const initializeData = async () => {
  const id = (route.params as { id?: string }).id
  if (id) {
    await loadAnimeDetails()
  }
}

// Use onServerPrefetch for SSR, onMounted for client-side
onServerPrefetch(async () => {
  await initializeData()
})

// Handle client-side mounting and route changes
onMounted(async () => {
  // Load data if not already loaded during SSR
  if (!anime.value && !error.value) {
    await initializeData()
  }
})

// Watch for route changes
watch(
  () => (route.params as { id?: string }).id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await loadAnimeDetails()
    }
  }
)
</script>

<style scoped lang="scss">
.anime-details {
  min-height: 100vh;
  background: var(--bg-primary);
}

.content-wrapper {
  width: 100%;
  min-height: inherit;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
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
  padding: 3rem;
  color: #ff6b6b;
  text-align: center;

  .retry-btn {
    padding: 12px 24px;
    margin-top: 1rem;
    font-size: 1rem;
    color: white;
    cursor: pointer;
    background: var(--primary-color);
    border: none;
    border-radius: 8px;
    transition: background-color 0.2s ease;

    &:hover {
      background: color-mix(in srgb, var(--primary-color) 80%, black);
    }
  }
}

.details-content {
  // Container and grid layout
  .container {
    width: 100%;
    max-width: 1200px;
    padding: 0 1rem;
    margin: 0 auto;

    @media (width <= 480px) {
      padding: 0 0.75rem;
    }
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem 0;

    @media (width >= 480px) {
      gap: 2rem;
      padding: 2rem 0;
    }

    @media (width >= 1024px) {
      grid-template-columns: 2fr 1fr;
      gap: 3rem;
    }
  }

  .main-content {
    min-width: 0; // Prevent flex overflow
  }

  .sidebar {
    @media (width <= 1023px) {
      order: -1;
    }
  }
}
</style>
