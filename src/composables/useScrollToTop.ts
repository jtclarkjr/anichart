import {
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  toValue,
  type MaybeRefOrGetter,
  type Ref
} from 'vue'

export type ScrollThreshold = number | 'viewport'

export interface UseScrollToTopOptions {
  threshold?: MaybeRefOrGetter<ScrollThreshold>
  behavior?: 'auto' | 'smooth'
}

export interface UseScrollToTopResult {
  isVisible: Readonly<Ref<boolean>>
  updateVisibility: () => void
  scrollToTop: () => void
}

export const useScrollToTop = (options: UseScrollToTopOptions = {}): UseScrollToTopResult => {
  const isVisible = ref(false)

  const updateVisibility = () => {
    if (typeof window === 'undefined') return

    const configuredThreshold = toValue(options.threshold ?? 'viewport')
    const threshold = configuredThreshold === 'viewport' ? window.innerHeight : configuredThreshold
    isVisible.value = window.scrollY >= threshold
  }

  const scrollToTop = () => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const behavior = prefersReducedMotion ? 'auto' : (options.behavior ?? 'smooth')
    window.scrollTo({ top: 0, behavior })
  }

  onMounted(() => {
    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') window.removeEventListener('scroll', updateVisibility)
  })

  return {
    isVisible: readonly(isVisible),
    updateVisibility,
    scrollToTop
  }
}
