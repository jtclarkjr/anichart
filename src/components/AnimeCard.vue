<template>
  <div class="anime-card" @click="$emit('click', anime.id)">
    <div class="card-image">
      <img
        ref="imageRef"
        :src="cardImageSrc"
        :srcset="cardImageSrcset"
        :sizes="CARD_IMAGE_SIZES"
        :alt="getDisplayTitle(anime.title)"
        :class="{ 'image-loaded': imageLoaded }"
        loading="lazy"
        decoding="async"
        @load="handleImageLoad"
        @error="handleImageError"
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { AnimeApi } from '@/utils/api/anime.api'
import type { Media } from '@/utils/types/anilist'

interface Props {
  anime: Media
}

const props = defineProps<Props>()
defineEmits<{
  click: [id: number]
}>()

const CARD_IMAGE_SIZES =
  '(min-width: 1024px) 220px, (min-width: 768px) 200px, (min-width: 640px) 180px, (min-width: 480px) 160px, 140px'

const imageLoaded = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)

const cardImageSrc = computed(() => {
  const { extraLarge, large, medium } = props.anime.coverImage
  return large || extraLarge || medium || undefined
})

const cardImageSrcset = computed(() => {
  const { extraLarge, large, medium } = props.anime.coverImage
  const candidates: Array<[string | null, number]> = [
    [medium, 100],
    [large, 230],
    [extraLarge, 460]
  ]
  const seenUrls = new Set<string>()

  const srcset = candidates
    .filter((candidate): candidate is [string, number] => {
      const [url] = candidate
      if (!url || seenUrls.has(url)) return false
      seenUrls.add(url)
      return true
    })
    .map(([url, width]) => `${url} ${width}w`)
    .join(', ')

  return srcset || undefined
})

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageLoaded.value = true
}

const syncCachedImage = () => {
  if (imageRef.value?.complete) {
    imageLoaded.value = true
  }
}

onMounted(syncCachedImage)

watch(cardImageSrc, async () => {
  imageLoaded.value = false
  await nextTick()
  syncCachedImage()
})

// Helper functions
const getDisplayTitle = AnimeApi.getDisplayTitle
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
    opacity: 0;
    object-fit: cover;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.image-loaded {
      opacity: 1;
    }
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

@media (prefers-reduced-motion: reduce) {
  .anime-card {
    transition: none;

    &:hover {
      transform: none;
    }
  }

  .card-image {
    img {
      opacity: 1;
      transition: none;
    }

    &:hover img {
      transform: none;
    }
  }
}
</style>
