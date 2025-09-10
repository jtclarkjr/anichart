import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode, command, ssrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_URL = env.ANILIST_API_URL

  if (!API_URL) {
    console.warn(
      'ANILIST_API_URL is not set in your environment (.env). Vite proxy will not work without it.'
    )
  }

  return {
    define: {
      'import.meta.env.ANILIST_API_URL': JSON.stringify(API_URL)
    },
    css: {
      preprocessorOptions: {
        scss: {}
      }
    },
    build: {
      cssCodeSplit: !ssrBuild,
      rollupOptions: ssrBuild
        ? {
            input: {
              server: 'src/entry-server.ts'
            },
            output: {
              format: 'esm'
            }
          }
        : {
            // For client build, use default index.html as entry point
            // This ensures index.html is processed and copied to dist
            input: 'index.html'
          }
    },
    plugins: [
      VueRouter({
        routesFolder: 'src/pages',
        dts: './typed-router.d.ts',
        importMode: 'async',
        extensions: ['.vue'],
        routeBlockLang: 'yaml',
        exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**']
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
          target: API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/graphql/, '')
          // configure: (proxy, _options) => {
          //   proxy.on('error', (err, _req, _res) => {
          //     console.error('Proxy error:', err)
          //   })
          //   proxy.on('proxyReq', (proxyReq, req, _res) => {
          //     console.log('Proxying request:', req.method, req.url, '->', API_URL)
          //   })
          //   proxy.on('proxyRes', (proxyRes, req, _res) => {
          //     console.log('Proxy response:', proxyRes.statusCode, req.url)
          //   })
          // }
        }
      }
    }
  }
})
