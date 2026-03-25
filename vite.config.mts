import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite-plus'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'

export const createAppConfig = (apiUrl: string | undefined, isSsrBuild = false) =>
  defineConfig({
    staged: {
      '*': 'vp check --fix'
    },
    define: {
      'import.meta.env.ANILIST_API_URL': JSON.stringify(apiUrl ?? '')
    },
    css: {
      preprocessorOptions: {
        scss: {}
      }
    },
    build: {
      cssCodeSplit: !isSsrBuild,
      rollupOptions: isSsrBuild
        ? {
            input: {
              server: 'src/entry-server.ts'
            },
            output: {
              format: 'esm' as const
            }
          }
        : {
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
      Components({
        dts: './components.d.ts'
      }),
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
        dts: './auto-imports.d.ts',
        vueTemplate: false,
        resolvers: []
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: apiUrl
      ? {
          proxy: {
            '/api/graphql': {
              target: apiUrl,
              changeOrigin: true,
              rewrite: (path: string) => path.replace(/^\/api\/graphql/, '')
            }
          }
        }
      : undefined
  })

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.ANILIST_API_URL

  if (!apiUrl) {
    console.warn(
      'ANILIST_API_URL is not set in your environment (.env). Vite proxy will not work without it.'
    )
  }

  return createAppConfig(apiUrl, isSsrBuild)
})
