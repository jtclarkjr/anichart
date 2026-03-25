import type { SSRRenderModule } from '../src/types/ssr'

interface ServerlessRequest {
  url?: string
  headers: Record<string, string | string[] | undefined>
}

interface ServerlessResponse {
  statusCode: number
  setHeader(name: string, value: string): void
  end(chunk?: string | Uint8Array): void
}

// Import the built server bundle
const serverEntryUrl = new URL('../dist/server/entry-server.mjs', import.meta.url)
const { render } = (await import(serverEntryUrl.href)) as SSRRenderModule
const clientDistUrl = new URL('../dist/client/', import.meta.url)

// Read the built client HTML template
const template = await Bun.file(new URL('index.html', clientDistUrl)).text()

// Content types mapping
const contentTypes: Record<string, string> = {
  js: 'application/javascript',
  css: 'text/css',
  html: 'text/html',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf'
}

const getRequestHost = (req: ServerlessRequest): string => {
  const { host } = req.headers
  return Array.isArray(host) ? (host[0] ?? 'localhost') : (host ?? 'localhost')
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  const pathname = new URL(req.url ?? '/', `http://${getRequestHost(req)}`).pathname

  // Serve static assets from dist/client
  if (pathname.startsWith('/assets/') || pathname.includes('.')) {
    try {
      const file = Bun.file(new URL(`.${pathname}`, clientDistUrl))

      if (await file.exists()) {
        // Set appropriate content type based on file extension
        const ext = pathname.split('.').pop()

        res.setHeader('Content-Type', contentTypes[ext ?? ''] ?? 'application/octet-stream')
        res.setHeader('Cache-Control', 'public, max-age=31536000') // 1 year cache for assets

        res.end(await file.bytes())
        return
      }
    } catch {
      // File not found, continue to SSR
    }
  }

  // Handle SSR for all other routes
  try {
    // Render the app server-side
    const { html, state } = await render(pathname)

    // Replace placeholders in the built template
    const responseHtml = template
      .replace('<!--app-html-->', html)
      .replace(
        '<!--pinia-state-->',
        `<script>window.__PINIA_STATE__=${JSON.stringify(state)}</script>`
      )

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache') // Don't cache HTML pages

    res.end(responseHtml)
    return
  } catch (error: unknown) {
    console.error('SSR Error:', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(`<h1>Server Error</h1><p>Something went wrong</p>`)
    return
  }
}
