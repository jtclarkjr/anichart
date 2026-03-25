import type { StateTree } from 'pinia'
import type { SSRContext } from 'vue/server-renderer'

export type SSRState = Record<string, StateTree>

export interface AppSSRContext extends SSRContext {
  modules?: Set<string>
}

export interface SSRRenderResult {
  html: string
  state: SSRState
  css?: string
}

export interface SSRRenderFunction {
  (url: string, renderContext?: AppSSRContext): Promise<SSRRenderResult>
}

export interface SSRRenderModule {
  render: SSRRenderFunction
}
