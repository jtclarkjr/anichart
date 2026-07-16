import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { configDefaults, defineConfig, loadEnv } from 'vite-plus'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'

export const createAppConfig = (apiUrl: string | undefined, isSsrBuild = false) =>
  defineConfig({
    staged: {
      '*': 'vp check --fix'
    },
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./src', import.meta.url))
    },
    lint: {
      plugins: ['vue', 'typescript', 'unicorn'],
      categories: {
        correctness: 'error',
        suspicious: 'warn'
      },
      rules: {
        'no-unused-vars': 'off',
        'typescript/no-unused-vars': 'error',
        'typescript/no-explicit-any': 'error'
      },
      ignorePatterns: [
        'dist',
        'dist-ssr',
        'coverage',
        'node_modules',
        'auto-imports.d.ts',
        'components.d.ts',
        'typed-router.d.ts',
        'src/auto-imports.d.ts',
        'src/components.d.ts'
      ],
      options: {
        typeAware: true,
        typeCheck: true
      }
    },
    fmt: {
      semi: false,
      tabWidth: 2,
      singleQuote: true,
      printWidth: 100,
      trailingComma: 'none',
      proseWrap: 'always',
      sortPackageJson: false,
      ignorePatterns: [
        'auto-imports.d.ts',
        'components.d.ts',
        'typed-router.d.ts',
        'src/auto-imports.d.ts',
        'src/components.d.ts'
      ]
    },
    define: {
      'import.meta.env.ANILIST_API_URL': JSON.stringify(apiUrl ?? '')
    },
    css: {
      preprocessorOptions: {
        scss: {}
      }
    },
    ssr: {
      noExternal: ['@apollo/client', 'graphql', 'graphql-tag']
    },
    build: {
      cssCodeSplit: false,
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
          {
            '@vue/test-utils': ['mount'],
            '@pinia/testing': ['createTestingPinia'],
            'vite-plus/test': [
              'afterAll',
              'afterEach',
              'assert',
              'assertType',
              'beforeAll',
              'beforeEach',
              'chai',
              'describe',
              'expect',
              'it',
              'suite',
              'test',
              'vi',
              'vitest'
            ]
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
