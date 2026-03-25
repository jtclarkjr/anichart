import { fileURLToPath, URL } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vite-plus'
import { createAppConfig } from './vite.config.mts'

export default mergeConfig(
  createAppConfig(undefined),
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./src', import.meta.url))
    }
  })
)
