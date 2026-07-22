<template>
  <div class="search-filters">
    <div class="search-section">
      <Input
        v-model="searchModel"
        type="search"
        placeholder="Search anime..."
        clearable
        clear-label="Clear search"
        @clear="handleSearchClear"
      />
    </div>
    <div class="filters">
      <Select v-model="sortModel" aria-label="Sort anime" @change="handleFilterChange">
        <option :value="MediaSort.POPULARITY_DESC">Popular</option>
        <option :value="MediaSort.TRENDING_DESC">Trending</option>
        <option :value="MediaSort.SCORE_DESC">Top Rated</option>
        <option :value="MediaSort.START_DATE_DESC">Recently Released</option>
      </Select>
      <Select v-model="seasonModel" aria-label="Filter by season" @change="handleFilterChange">
        <option v-for="season in availableSeasons" :key="season.value" :value="season.value">
          {{ season.label }}
        </option>
      </Select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimeApi } from '@/utils/api/anime.api'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
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

  // Season year logic based on current season:
  // - If Winter: Spring is upcoming (current year), Summer/Fall are previous year
  // - If Spring: Summer/Fall are current year, Winter is current year
  // - If Summer: Fall is current year, Spring was current year, Winter is current year
  // - If Fall: Spring/Summer were current year, Winter is next year

  // Spring
  seasons.push({
    value: 'SPRING',
    label: `${seasonNames.SPRING} ${year}`
  })

  // Summer
  seasons.push({
    value: 'SUMMER',
    label: `${seasonNames.SUMMER} ${currentSeason === 'WINTER' ? year - 1 : year}`
  })

  // Fall
  seasons.push({
    value: 'FALL',
    label: `${seasonNames.FALL} ${currentSeason === 'WINTER' ? year - 1 : year}`
  })

  // Winter
  if (currentSeason === 'FALL') {
    seasons.push({
      value: 'WINTER',
      label: `${seasonNames.WINTER} ${year + 1}`
    })
  } else {
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

const handleSearchClear = () => {
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

.filters {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
</style>
