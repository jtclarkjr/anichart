import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'

// Manual route definitions for now to fix SSR
const routes = [
  {
    path: '/anime',
    name: 'anime-index',
    component: () => import('../pages/anime/index.vue')
  },
  {
    path: '/anime/:id',
    name: 'anime-id',
    component: () => import('../pages/anime/[id].vue')
  }
]

const pages = createRouter({
  history:
    typeof window !== 'undefined'
      ? createWebHistory(import.meta.env.BASE_URL)
      : createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/anime'
    },
    ...routes,
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/anime'
    }
  ]
})

// Report client-side navigation errors without mutating document layout.
if (typeof window !== 'undefined') {
  pages.onError((error) => {
    console.error('Router navigation error:', error)
  })
}

export default pages
