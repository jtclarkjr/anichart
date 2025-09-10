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

// Add navigation guards (client-side only)
if (typeof window !== 'undefined') {
  let isNavigating = false

  pages.beforeEach((to, from, next) => {
    // Ignore Vite HMR and development paths in browser only
    if (
      to.path.startsWith('/@vite/') ||
      to.path.startsWith('/__vite') ||
      to.path.startsWith('/src/')
    ) {
      return false
    }

    // Set loading state for navigation
    if (from.path !== to.path) {
      isNavigating = true
      // Add a subtle loading class to body for global styling
      document.body.classList.add('route-loading')
    }

    next()
  })

  pages.afterEach(() => {
    // Clear loading state after navigation completes
    if (isNavigating) {
      // Small delay to allow for smooth transition
      setTimeout(() => {
        document.body.classList.remove('route-loading')
        isNavigating = false
      }, 100)
    }
  })

  // Handle navigation errors
  pages.onError((error) => {
    console.error('Router navigation error:', error)
    document.body.classList.remove('route-loading')
    isNavigating = false
  })
}

export default pages
