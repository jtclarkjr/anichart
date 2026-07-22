import {
  computed,
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref
} from 'vue'

export interface UseInfiniteScrollOptions {
  enabled?: MaybeRefOrGetter<boolean>
  root?: MaybeRefOrGetter<Element | null | undefined>
  rootMargin?: string
  threshold?: number
  fallbackDistance?: number
}

export interface UseInfiniteScrollResult {
  isSupported: Readonly<Ref<boolean>>
  isLoading: Readonly<Ref<boolean>>
  check: () => void
  stop: () => void
}

export const useInfiniteScroll = (
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  onLoad: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult => {
  const enabled = options.enabled ?? true
  const isSupported = ref(false)
  const isLoading = ref(false)
  const isMounted = ref(false)
  let observer: IntersectionObserver | null = null

  const canLoad = computed(() => toValue(enabled) && !isLoading.value)

  const load = async () => {
    if (!canLoad.value) return

    isLoading.value = true
    try {
      await onLoad()
    } finally {
      isLoading.value = false
    }
  }

  const disconnectObserver = () => {
    observer?.disconnect()
    observer = null
  }

  const connectObserver = () => {
    disconnectObserver()
    if (!isMounted.value || !toValue(enabled) || typeof IntersectionObserver === 'undefined') {
      return
    }

    const element = toValue(target)
    if (!element) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void load()
      },
      {
        root: toValue(options.root) ?? null,
        rootMargin: options.rootMargin ?? '200px',
        threshold: options.threshold ?? 0.1
      }
    )
    observer.observe(element)
  }

  const check = () => {
    if (typeof document === 'undefined' || !canLoad.value) return

    const documentElement = document.documentElement
    const scrollTop = documentElement.scrollTop || document.body.scrollTop
    const distanceFromBottom =
      documentElement.scrollHeight - (scrollTop + documentElement.clientHeight)

    if (distanceFromBottom <= (options.fallbackDistance ?? 200)) void load()
  }

  const stopWatching = watch(
    [() => toValue(target), () => toValue(enabled), () => toValue(options.root)],
    connectObserver,
    { flush: 'post' }
  )

  const stop = () => {
    disconnectObserver()
    if (typeof window !== 'undefined') window.removeEventListener('scroll', check)
    stopWatching()
  }

  onMounted(() => {
    isMounted.value = true
    isSupported.value = typeof IntersectionObserver !== 'undefined'
    connectObserver()
    window.addEventListener('scroll', check, { passive: true })
    check()
  })

  onBeforeUnmount(stop)

  return {
    isSupported: readonly(isSupported),
    isLoading: readonly(isLoading),
    check,
    stop
  }
}
