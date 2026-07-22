import {
  nextTick,
  onMounted,
  readonly,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref
} from 'vue'

export interface UseProgressiveImageResult {
  imageRef: Ref<HTMLImageElement | null>
  isLoaded: Readonly<Ref<boolean>>
  handleLoad: () => void
  handleError: () => void
  syncCachedImage: () => void
}

export const useProgressiveImage = (
  source: MaybeRefOrGetter<string | null | undefined>
): UseProgressiveImageResult => {
  const imageRef = ref<HTMLImageElement | null>(null)
  const isLoaded = ref(false)

  const markLoaded = () => {
    isLoaded.value = true
  }

  const syncCachedImage = () => {
    if (imageRef.value?.complete) markLoaded()
  }

  onMounted(syncCachedImage)

  watch(
    () => toValue(source),
    async () => {
      isLoaded.value = false
      await nextTick()
      syncCachedImage()
    }
  )

  return {
    imageRef,
    isLoaded: readonly(isLoaded),
    handleLoad: markLoaded,
    handleError: markLoaded,
    syncCachedImage
  }
}
