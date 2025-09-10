import { createServer, ViteDevServer } from 'vite'
import { createServer as createHttpServer } from 'node:http'

const DEV_PORT = 5173
const SSR_PORT = 5174

// Create Vite dev server with Node.js HTTP server to avoid Bun WebSocket issues
const vite: ViteDevServer = await createServer({
  server: {
    middlewareMode: false,
    port: DEV_PORT,
    // Disable WebSocket to avoid Bun compatibility issues
    hmr: { port: DEV_PORT + 1 }
  },
  appType: 'spa'
})

// Start Vite dev server
await vite.listen()
console.log(`Vite dev server running at http://localhost:${DEV_PORT}`)

// Create SSR server that uses the dev server for assets
const ssrVite: ViteDevServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
})

// Start SSR server
Bun.serve({
  port: SSR_PORT,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const pathname = url.pathname

    try {
      // Read template and transform it
      let template = await Bun.file('index.html').text()
      template = await ssrVite.transformIndexHtml(pathname, template)

      // Update the template to point to the dev server for assets
      template = template.replace(
        'src="/src/entry-client.ts"',
        `src="http://localhost:${DEV_PORT}/src/entry-client.ts"`
      )

      // Load server module and render
      const {
        render
      }: { render: (url: string) => Promise<{ html: string; state: Record<string, unknown> }> } =
        await ssrVite.ssrLoadModule('/src/entry-server.ts')
      const { html, state } = await render(pathname)

      // Replace SSR placeholders
      const responseHtml = template
        .replace('<!--app-html-->', html)
        .replace(
          '<!--pinia-state-->',
          `<script>window.__PINIA_STATE__=${JSON.stringify(state)}</script>`
        )

      return new Response(responseHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    } catch (error: any) {
      ssrVite.ssrFixStacktrace(error)
      console.error('SSR Error:', error)
      return new Response(`<h1>SSR Error</h1><pre>${error.stack}</pre>`, {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }
  }
})

console.log(`SSR server running at http://localhost:${SSR_PORT} (powered by Bun)`)
console.log(`Visit http://localhost:${SSR_PORT} for SSR, http://localhost:${DEV_PORT} for SPA dev`)

// Keep the process alive
process.stdin.resume()
