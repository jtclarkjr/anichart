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

const isSSRRenderFunction = (value: unknown): value is SSRRenderFunction =>
  typeof value === 'function'

export const getSSRRenderModule = (value: unknown): SSRRenderModule => {
  if (typeof value !== 'object' || value === null || !('render' in value)) {
    throw new TypeError('SSR entry module does not export a render function')
  }

  const { render } = value

  if (!isSSRRenderFunction(render)) {
    throw new TypeError('SSR entry module does not export a render function')
  }

  return { render }
}
