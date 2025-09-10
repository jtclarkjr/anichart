<template>
  <div class="search-filters">
    <div class="search-section">
      <input
        v-model="searchModel"
        type="text"
        placeholder="Search anime..."
        class="search-input"
      />
    </div>
    <div class="filters">
      <select v-model="sortModel" @change="handleFilterChange" class="filter-select">
        <option :value="MediaSort.POPULARITY_DESC">Popular</option>
        <option :value="MediaSort.TRENDING_DESC">Trending</option>
        <option :value="MediaSort.SCORE_DESC">Top Rated</option>
        <option :value="MediaSort.START_DATE_DESC">Recently Released</option>
      </select>
      <select v-model="seasonModel" @change="handleFilterChange" class="filter-select">
        <option v-for="season in availableSeasons" :key="season.value" :value="season.value">
          {{ season.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimeApi } from '@/utils/api/anime.api'
import { MediaSort } from '@/utils/types/anilist'
import type { MediaSeason } from '@/utils/types/anilist'

interface Props {
  searchQuery: string
  selectedSort: MediaSort
  selectedSeason: MediaSeason | ''
}

interface Emits {
  'update:searchQuery': [value: string]
  'update:selectedSort': [value: MediaSort]
  'update:selectedSeason': [value: MediaSeason | '']
  filterChange: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties for v-model binding
const seasonModel = computed({
  get: () => props.selectedSeason,
  set: (value: MediaSeason | '') => emit('update:selectedSeason', value)
})

const sortModel = computed({
  get: () => props.selectedSort,
  set: (value: MediaSort) => emit('update:selectedSort', value)
})

const searchModel = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value)
})

// Available seasons based on current time of year
const availableSeasons = computed(() => {
  const { season: currentSeason, year } = AnimeApi.getCurrentSeason()
  const seasons = []

  const seasonNames = {
    WINTER: 'Winter',
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall'
  } as const

  // Always show current year's Spring, Summer, Fall
  const currentYearSeasons = ['SPRING', 'SUMMER', 'FALL'] as const
  for (const seasonKey of currentYearSeasons) {
    seasons.push({
      value: seasonKey,
      label: `${seasonNames[seasonKey]} ${year}`
    })
  }

  // For Winter, show next year's Winter only if we're currently in Fall or later
  // Otherwise, Winter refers to the current year's Winter
  if (currentSeason === 'FALL') {
    // Show upcoming Winter (next year)
    seasons.push({
      value: 'WINTER',
      label: `${seasonNames.WINTER} ${year + 1}`
    })
  } else {
    // Show current year's Winter (current or past)
    seasons.push({
      value: 'WINTER',
      label: `${seasonNames.WINTER} ${year}`
    })
  }

  return seasons
})

// Event handler for filter changes
const handleFilterChange = () => {
  emit('filterChange')
}
</script>

<style scoped lang="scss">
.search-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (width >= 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-section {
  flex: 1;
  width: 100%;

  @media (width >= 768px) {
    flex: 0 1 500px;
    max-width: 500px;
  }

  @media (width >= 1024px) {
    flex: 0 1 600px;
    max-width: 600px;
  }
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  color: var(--text-color);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.filters {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.filter-select {
  padding: 8px 32px 8px 12px; /* Add extra right padding for chevron */
  font-size: 0.9rem;
  color: var(--text-color);
  appearance: none;
  cursor: pointer;
  background: var(--bg-secondary);
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  option {
    color: var(--text-color);
    background: var(--bg-secondary);
  }
}
</style>
