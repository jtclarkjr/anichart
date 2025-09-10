<template>
  <div class="info-panel">
    <h3>Information</h3>
    <div class="info-grid">
      <div class="info-item" v-if="anime.startDate?.year">
        <span class="label">Start Date:</span>
        <span class="value">{{ formatDate(anime.startDate) }}</span>
      </div>
      <div class="info-item" v-if="anime.endDate?.year">
        <span class="label">End Date:</span>
        <span class="value">{{ formatDate(anime.endDate) }}</span>
      </div>
      <div class="info-item" v-if="anime.season">
        <span class="label">Season:</span>
        <span class="value">{{ anime.season }} {{ anime.seasonYear }}</span>
      </div>
      <div class="info-item" v-if="anime.source">
        <span class="label">Source:</span>
        <span class="value">{{ formatSource(anime.source) }}</span>
      </div>
      <div class="info-item" v-if="anime.studios?.nodes?.length">
        <span class="label">Studio:</span>
        <span class="value">{{ anime.studios.nodes.map((s) => s.name).join(', ') }}</span>
      </div>
      <div class="info-item" v-if="anime.popularity">
        <span class="label">Popularity:</span>
        <span class="value">#{{ anime.popularity.toLocaleString() }}</span>
      </div>
      <div class="info-item" v-if="anime.favourites">
        <span class="label">Favourites:</span>
        <span class="value">{{ anime.favourites.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Media, MediaSource } from '@/utils/types/anilist'

interface Props {
  anime: Media
}

defineProps<Props>()

const formatDate = (
  date: { year: number | null; month: number | null; day: number | null } | null
): string => {
  if (!date?.year) return 'TBA'
  if (!date.month) return date.year.toString()
  if (!date.day) return `${getMonthName(date.month)} ${date.year}`
  return `${getMonthName(date.month)} ${date.day}, ${date.year}`
}

const getMonthName = (month: number): string => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  return months[month - 1] || 'Unknown'
}

const formatSource = (source: MediaSource | null): string => {
  if (!source) return 'Unknown'

  return source
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
</script>

<style scoped lang="scss">
.info-panel {
  max-width: 100%;
  height: fit-content;
  padding: 1.5rem;
  overflow-wrap: break-word;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;

  @media (width <= 480px) {
    padding: 1rem;
  }

  h3 {
    padding-bottom: 0.5rem;
    margin: 0 0 1rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-color);
    border-bottom: 2px solid var(--primary-color);
  }
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  padding-bottom: 0.75rem;
  overflow-wrap: break-word;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .label {
    flex-shrink: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-color);
    hyphens: auto;
    overflow-wrap: break-word;
  }
}
</style>
