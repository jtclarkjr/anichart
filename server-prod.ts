import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const port = process.env.PORT || 8080

// Import the built server bundle
const {
  render
}: { render: (url: string) => Promise<{ html: string; state: Record<string, unknown> }> } =
  await import('./dist/server/entry-server.js')

// Read the built client HTML template
const template = await Bun.file(join(__dirname, 'dist/client/index.html')).text()

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

// Serve static files and handle SSR
Bun.serve({
  port: Number(port),
  hostname: '0.0.0.0',
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Serve static assets from dist/client
    if (pathname.startsWith('/assets/') || pathname.includes('.')) {
      try {
        const filePath = join(__dirname, 'dist/client', pathname)
        const file = Bun.file(filePath)

        if (await file.exists()) {
          // Set appropriate content type based on file extension
          const ext = pathname.split('.').pop()

          return new Response(file, {
            headers: {
              'Content-Type': contentTypes[ext || ''] || 'application/octet-stream',
              'Cache-Control': 'public, max-age=31536000' // 1 year cache for assets
            }
          })
        }
      } catch (error) {
        console.error('Error serving static file:', error)
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

      return new Response(responseHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache' // Don't cache HTML pages
        }
      })
    } catch (error: any) {
      console.error('SSR Error:', error)
      return new Response(`<h1>Server Error</h1><p>Something went wrong</p>`, {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }
  }
})

console.log(`Production SSR server running at http://0.0.0.0:${port} (powered by Bun)`)
console.log(`Serving static files from ./dist/client`)
console.log(`Server-side rendering with ./dist/server/entry-server.js`)
