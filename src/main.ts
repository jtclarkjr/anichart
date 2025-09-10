import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import pages from '@/pages'
import '@/assets/styles/anime.scss'

createApp(App).use(pages).use(createPinia()).mount('#app')
