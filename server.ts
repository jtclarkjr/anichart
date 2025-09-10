import { createServer, ViteDevServer } from 'vite'

const port = process.env.PORT || 5174

// Create Vite server for SSR development
const vite: ViteDevServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
})

// Start a Bun server that handles SSR
Bun.serve({
  port: Number(port),
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Skip SSR for static assets and Vite internal routes
    if (
      pathname.startsWith('/src/') ||
      pathname.startsWith('/@') ||
      pathname.startsWith('/node_modules/') ||
      (pathname.includes('.') && !pathname.endsWith('/')) ||
      pathname === '/favicon.ico'
    ) {
      return new Response('Static asset - should be handled by Vite dev server', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    try {
      // Read template and transform it
      let template = await Bun.file('index.html').text()
      template = await vite.transformIndexHtml(pathname, template)

      // Load server module and render
      const {
        render
      }: {
        render: (
          url: string,
          renderContext?: Record<string, unknown>
        ) => Promise<{ html: string; state: Record<string, unknown>; css?: string }>
      } = await vite.ssrLoadModule('/src/entry-server.ts')
      const renderContext = {}
      const { html, state, css } = await render(pathname, renderContext)

      // Replace SSR placeholders
      let responseHtml = template
        .replace('<!--app-html-->', html)
        .replace(
          '<!--pinia-state-->',
          `<script>window.__PINIA_STATE__=${JSON.stringify(state)}</script>`
        )

      // Inject CSS if collected during SSR
      if (css) {
        responseHtml = responseHtml.replace('</head>', `<style data-vite-ssr>${css}</style></head>`)
      }

      return new Response(responseHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    } catch (error: any) {
      vite.ssrFixStacktrace(error)
      console.error('SSR Error:', error)
      return new Response(`<h1>SSR Error</h1><pre>${error.stack}</pre>`, {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }
  }
})

console.log(`🚀 SSR server running at http://localhost:${port} (powered by Bun)`)
console.log(`🔧 Run 'bun run dev' in another terminal for HMR and asset serving`)
