import { fileURLToPath, URL } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'

export default defineConfig({
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
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./src', import.meta.url))
  }
})
