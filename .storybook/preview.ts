import type { Preview } from '@storybook/vue3-vite'
import '@jtclarkjr/component-library-vue/style.css'
import '../src/assets/styles/anime.scss'

if (typeof document !== 'undefined') {
  document.documentElement.dataset.clvTheme = 'aqua'
}

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    controls: { expanded: true },
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default preview
