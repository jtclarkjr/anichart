import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import pages from '@/pages'
import '@/assets/styles/anime.scss'

// Create the app instance
const app = createSSRApp(App)

// Create Pinia instance and restore SSR state if available
const pinia = createPinia()
if (typeof window !== 'undefined' && window.__PINIA_STATE__) {
  pinia.state.value = window.__PINIA_STATE__
}

// Install plugins
app.use(pages)
app.use(pinia)

// Wait for router to be ready and then mount
pages.isReady().then(() => {
  app.mount('#app')
})

// TypeScript declaration for global state
declare global {
  interface Window {
    __PINIA_STATE__: Record<string, unknown>
    __ENV__: { ANILIST_API_URL: string }
  }
}
