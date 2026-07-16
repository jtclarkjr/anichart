import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import pages from '@/pages'
import '@/assets/styles/anime.scss'

// Create the app instance
const app = createSSRApp(App)

// Create Pinia instance and restore SSR state if available
const pinia = createPinia()
const initialState = typeof window !== 'undefined' ? window['__PINIA_STATE__'] : undefined

if (initialState) {
  pinia.state.value = initialState
}

// Install plugins
app.use(pages)
app.use(pinia)

// Wait for router to be ready and then mount
void pages.isReady().then(() => {
  app.mount('#app')
})
