<template>
  <div
    class="banner"
    :style="{ backgroundImage: anime.bannerImage ? `url(${anime.bannerImage})` : 'none' }"
  >
    <div class="banner-content">
      <div class="cover-image">
        <img :src="getSafeImageUrl(anime.coverImage)" :alt="getDisplayTitle(anime.title)" />
      </div>
      <div class="basic-info">
        <h1 class="title">{{ getDisplayTitle(anime.title) }}</h1>
        <div class="alt-titles" v-if="anime.title.romaji !== getDisplayTitle(anime.title)">
          <p v-if="anime.title.romaji">{{ anime.title.romaji }}</p>
          <p v-if="anime.title.native">{{ anime.title.native }}</p>
        </div>
        <div class="meta-info">
          <div class="meta-item">
            <span class="label">Score:</span>
            <span class="value score">{{ formatScore(anime.averageScore) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Status:</span>
            <span class="value">{{ formatStatus(anime.status) }}</span>
          </div>
          <div class="meta-item" v-if="anime.format">
            <span class="label">Format:</span>
            <span class="value">{{ anime.format }}</span>
          </div>
          <div class="meta-item" v-if="anime.episodes">
            <span class="label">Episodes:</span>
            <span class="value">{{ anime.episodes }}</span>
          </div>
          <div class="meta-item" v-if="anime.duration">
            <span class="label">Duration:</span>
            <span class="value">{{ anime.duration }} min</span>
          </div>
        </div>
        <div class="genres">
          <span v-for="genre in anime.genres" :key="genre" class="genre-tag">
            {{ genre }}
          </span>
        </div>
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

// Helper functions
const getDisplayTitle = AnimeApi.getDisplayTitle
const getSafeImageUrl = AnimeApi.getSafeImageUrl
const formatScore = AnimeApi.formatScore
const formatStatus = AnimeApi.formatStatus
</script>

<style scoped lang="scss">
.banner {
  position: relative;
  display: flex;
  align-items: center;
  height: auto;
  min-height: 400px;
  padding: 2rem 0.75rem;
  overflow: hidden;
  background-color: var(--bg-secondary);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;

  @media (width >= 480px) {
    align-items: flex-end;
    min-height: 450px;
    padding: 2rem 1rem;
  }

  @media (width >= 768px) {
    min-height: 500px;
    padding: 2.5rem 1rem;
  }

  @media (width >= 1024px) {
    min-height: 550px;
  }

  &::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      135deg,
      rgb(0 0 0 / 80%) 0%,
      rgb(0 0 0 / 60%) 50%,
      rgb(0 0 0 / 90%) 100%
    );
  }
}

.banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  @media (width >= 480px) {
    gap: 1.5rem;
  }

  @media (width >= 768px) {
    gap: 2rem;
  }

  @media (width <= 768px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    text-align: center;
  }
}

.cover-image {
  flex-shrink: 0;

  img {
    width: 230px;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgb(0 0 0 / 60%);

    @media (width <= 480px) {
      width: 140px;
    }

    @media (width <= 768px) {
      width: 160px;
    }
  }
}

.basic-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 230px;
  color: white;

  @media (width <= 768px) {
    align-items: center;
    justify-content: center;
    min-height: auto;
  }

  @media (width <= 480px) {
    justify-content: flex-start;
    min-height: 200px;
  }
}

.title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.1;
  text-shadow: 2px 2px 8px rgb(0 0 0 / 80%);
}

.alt-titles {
  margin-bottom: 1rem;
  opacity: 0.9;

  p {
    margin: 0.25rem 0;
    font-size: 1.1rem;
    text-shadow: 1px 1px 4px rgb(0 0 0 / 80%);
  }
}

.meta-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0;

  @media (width <= 480px) {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
    margin: 1rem 0;
  }

  @media (width <= 768px) {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  }
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 1px 1px 3px rgb(0 0 0 / 80%);
    opacity: 0.8;
  }

  .value {
    font-size: 1rem;
    font-weight: 500;
    text-shadow: 1px 1px 4px rgb(0 0 0 / 80%);

    &.score {
      font-weight: 700;
      color: var(--primary-color);
    }
  }
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;

  @media (width <= 768px) {
    justify-content: center;
  }
}

.genre-tag {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  text-shadow: 1px 1px 3px rgb(0 0 0 / 60%);
  background: rgb(255 255 255 / 15%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  &:hover {
    background: rgb(255 255 255 / 25%);
    transform: translateY(-2px);
  }
}
</style>
