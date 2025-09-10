export interface SSRRenderResult {
  html: string
  state: Record<string, unknown>
  css?: string
}

export interface SSRRenderFunction {
  (url: string, renderContext?: Record<string, unknown>): Promise<SSRRenderResult>
}
