<template>
  <div class="anime-details">
    <BackToListButton />

    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <Button class="retry-btn" size="lg" @click="retryAnimeDetails">Retry</Button>
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
      <Spinner class="anime-details__spinner" decorative size="lg" />
      <p>Loading anime details...</p>
    </div>

    <!-- Empty state for when no data and no error (shouldn't happen with proper routing) -->
    <div v-else class="error">
      <p>Anime not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimeBanner from '@/components/AnimeBanner.vue'
import AnimeDescription from '@/components/AnimeDescription.vue'
import AnimeMetadata from '@/components/AnimeMetadata.vue'
import BackToListButton from '@/components/BackToListButton.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useAnimeStore } from '@/stores/anime'

const route = useRoute()
const animeStore = useAnimeStore()

const animeId = computed(() => {
  const id = (route.params as { id?: string }).id
  if (!id || typeof id !== 'string') {
    return null
  }

  const parsedId = Number.parseInt(id, 10)
  return Number.isNaN(parsedId) ? null : parsedId
})

const anime = computed(() =>
  animeId.value === null ? undefined : animeStore.animeDetailsById[animeId.value]
)
const error = ref<string | null>(null)
const isLoading = ref(false)

const loadAnimeDetails = async (): Promise<void> => {
  if (animeId.value === null) {
    error.value = 'Invalid anime ID'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await animeStore.loadAnimeDetails(animeId.value)
  } catch (err) {
    error.value = 'Failed to load anime details. Please try again.'
    console.error('Error loading anime details:', err)
  } finally {
    isLoading.value = false
  }
}

const retryAnimeDetails = async () => {
  if (animeId.value !== null) {
    animeStore.invalidateAnimeDetails(animeId.value)
  }

  await loadAnimeDetails()
}

// Populate Pinia during SSR so the detail record is serialized into the response.
onServerPrefetch(loadAnimeDetails)

// Skip hydration and route-change requests when the record is already cached.
onMounted(async () => {
  // With out-in transitions, the list has finished leaving before this runs.
  // Reset only the new detail view so the visible list never jumps during prefetch.
  window.scrollTo(0, 0)

  if (!anime.value && !error.value) {
    await loadAnimeDetails()
  }
})

watch(animeId, async (newId, oldId) => {
  if (newId !== oldId) {
    error.value = null
    if (newId !== null && !animeStore.animeDetailsById[newId]) {
      await loadAnimeDetails()
    }
  }
})
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

  .anime-details__spinner {
    margin-bottom: 1rem;
  }
}

.error {
  padding: 3rem;
  color: #ff6b6b;
  text-align: center;

  .retry-btn {
    margin-top: 1rem;
    border-radius: 8px;
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
