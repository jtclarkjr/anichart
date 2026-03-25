import { createSSRApp, type Plugin } from 'vue'
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
app.use(pinia as unknown as Plugin)

// Wait for router to be ready and then mount
pages.isReady().then(() => {
  app.mount('#app')
})
