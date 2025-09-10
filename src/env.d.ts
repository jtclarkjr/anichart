/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
interface ImportMetaEnv {
  readonly VITE_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
