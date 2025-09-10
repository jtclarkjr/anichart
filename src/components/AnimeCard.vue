<template>
  <div class="anime-card" @click="$emit('click', anime.id)">
    <div class="card-image">
      <img
        :src="getSafeImageUrl(anime.coverImage)"
        :alt="getDisplayTitle(anime.title)"
        loading="lazy"
      />
      <div class="card-overlay">
        <div class="score" v-if="anime.averageScore">{{ anime.averageScore }}%</div>
      </div>
    </div>
    <div class="card-content">
      <h3 class="title">{{ getDisplayTitle(anime.title) }}</h3>
      <div class="meta">
        <span class="year">{{ formatYear(anime.startDate) }}</span>
        <span class="format" v-if="anime.format">{{ anime.format }}</span>
      </div>
      <div class="genres">
        <span v-for="genre in anime.genres.slice(0, 2)" :key="genre" class="genre-tag">
          {{ genre }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimeApi } from '@/utils/api/anime.api'
import type { Media } from '@/utils/types/anilist'

interface Props {
  anime: Media
}

defineProps<Props>()
defineEmits<{
  click: [id: number]
}>()

// Helper functions
const getDisplayTitle = AnimeApi.getDisplayTitle
const getSafeImageUrl = AnimeApi.getSafeImageUrl
const formatYear = AnimeApi.formatYear
</script>

<style scoped lang="scss">
.anime-card {
  overflow: hidden;
  cursor: pointer;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 8px 25px rgb(0 0 0 / 30%);
    transform: translateY(-4px);
  }
}

.card-image {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px;
  background: linear-gradient(to bottom, transparent 0%, transparent 60%, rgb(0 0 0 / 80%) 100%);
}

.score {
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: var(--primary-color);
  border-radius: 12px;
}

.card-content {
  padding: 12px;
}

.title {
  display: -webkit-box;
  margin: 0 0 8px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
  -webkit-box-orient: vertical;
}

.meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.75rem;
  color: var(--text-muted);

  .year,
  .format {
    padding: 2px 6px;
    background: var(--surface-color);
    border-radius: 4px;
  }
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.genre-tag {
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-color);
  background: var(--accent-color);
  border-radius: 4px;
}
</style>
