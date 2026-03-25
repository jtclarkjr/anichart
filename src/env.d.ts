/// <reference types="vite-plus/client" />
/// <reference types="unplugin-vue-router/client" />

// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
  readonly ANILIST_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __PINIA_STATE__?: Record<string, import('pinia').StateTree>
  __ENV__?: { ANILIST_API_URL?: string }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}
