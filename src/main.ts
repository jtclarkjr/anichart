import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import pages from '@/pages'
import '@/assets/styles/anime.scss'

const app = createApp(App)

app.use(pages)
app.use(createPinia())
app.mount('#app')
