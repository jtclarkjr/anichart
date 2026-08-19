import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from 'vite-plus/test/browser-playwright'
import { defineConfig, mergeConfig } from 'vite-plus'
import { createAppConfig } from './vite.config'

const repositoryRoot = dirname(fileURLToPath(import.meta.url))

export default mergeConfig(
  createAppConfig(undefined),
  defineConfig({
    plugins: [storybookTest({ configDir: join(repositoryRoot, '.storybook') })],
    optimizeDeps: {
      include: [
        '@storybook/addon-a11y/preview',
        '@storybook/vue3-vite',
        '@jtclarkjr/component-library-vue',
        'aria-query',
        'lz-string',
        'pretty-format',
        'vitest'
      ]
    },
    test: {
      name: 'storybook',
      root: repositoryRoot,
      setupFiles: [join(repositoryRoot, '.storybook/vitest.setup.ts')],
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' }]
      }
    }
  })
)
