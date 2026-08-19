import { inject } from '@vercel/analytics'

let initialized = false

export const initializeVercelAnalytics = (): void => {
  const runtimeEnvironment = Reflect.get(window, '__ENV__')
  const runtimeEnabled = runtimeEnvironment?.VERCEL_ANALYTICS_ENABLED
  const analyticsEnabled = runtimeEnabled ?? __VERCEL_ANALYTICS_ENABLED__

  if (!analyticsEnabled || initialized) {
    return
  }

  initialized = true
  inject({ mode: 'production', debug: false })
}
