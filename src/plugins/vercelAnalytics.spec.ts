import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

const { inject } = vi.hoisted(() => ({ inject: vi.fn() }))

vi.mock('@vercel/analytics', () => ({ inject }))

afterEach(() => {
  Reflect.deleteProperty(window, '__ENV__')
  inject.mockReset()
  vi.resetModules()
})

describe('initializeVercelAnalytics', () => {
  it('initializes production analytics once when the SSR runtime flag is enabled', async () => {
    Reflect.set(window, '__ENV__', { VERCEL_ANALYTICS_ENABLED: true })
    const { initializeVercelAnalytics } = await import('./vercelAnalytics')

    initializeVercelAnalytics()
    initializeVercelAnalytics()

    expect(inject).toHaveBeenCalledOnce()
    expect(inject).toHaveBeenCalledWith({ mode: 'production', debug: false })
  })

  it('does not initialize analytics when the SSR runtime flag is disabled', async () => {
    Reflect.set(window, '__ENV__', { VERCEL_ANALYTICS_ENABLED: false })
    const { initializeVercelAnalytics } = await import('./vercelAnalytics')

    initializeVercelAnalytics()

    expect(inject).not.toHaveBeenCalled()
  })

  it('uses the disabled compile-time fallback when the runtime flag is absent', async () => {
    const { initializeVercelAnalytics } = await import('./vercelAnalytics')

    initializeVercelAnalytics()

    expect(inject).not.toHaveBeenCalled()
  })
})
