import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  define: {
    'import.meta.env.ANILIST_API_URL': JSON.stringify(process.env.ANILIST_API_URL)
  },
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',
      dts: './typed-router.d.ts',
      importMode: 'async',
      extensions: ['.vue'],
      routeBlockLang: 'yaml'
    }),
    vue(),
    Components(),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        'vitest',
        {
          '@vue/test-utils': ['mount'],
          '@pinia/testing': ['createTestingPinia'],
          vitest: ['assertType']
        },
        {
          from: 'vue-router',
          imports: ['RouteLocationRaw'],
          type: true
        }
      ],
      defaultExportByFilename: false,
      dirs: ['src/utils/helpers/index.ts', 'src/utils/api/index.ts', 'src/stores/index.ts'],
      dts: true,
      vueTemplate: false,
      resolvers: [],
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api/graphql': {
        target: process.env.ANILIST_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/graphql/, ''),
        // For debugging purposes
        // configure: (proxy, _options) => {
        //   proxy.on('error', (err, _req, _res) => {
        //     console.error('Proxy error:', err)
        //   })
        //   proxy.on('proxyReq', (proxyReq, req, _res) => {
        //     console.log('Proxying request:', req.method, req.url, '-> target')
        //   })
        //   proxy.on('proxyRes', (proxyRes, req, _res) => {
        //     console.log('Proxy response:', proxyRes.statusCode, req.url)
        //   })
        // }
      }
    }
  }
})
