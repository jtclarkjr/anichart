import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import pages from '@/pages'
import type { SSRRenderResult } from '@/types/ssr'
// Import styles for SSR
import '@/assets/styles/anime.scss'

export async function render(
  url: string,
  renderContext?: Record<string, unknown>
): Promise<SSRRenderResult> {
  // Create the app instance
  const app = createSSRApp(App)

  // Create fresh stores for each request
  const pinia = createPinia()

  // Install plugins
  app.use(pages)
  app.use(pinia)

  // Set the current location for router
  await pages.push(url)
  await pages.isReady()

  // Create render context to collect CSS
  const ctx = renderContext || {}

  // Render the app to HTML string
  const html = await renderToString(app, ctx)

  // Return both HTML and the initial state for hydration
  return {
    html,
    state: pinia.state.value,
    css: ctx.modules ? Array.from(ctx.modules).join('') : ''
  }
}
