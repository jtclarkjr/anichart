import { createServer, ViteDevServer } from 'vite'

// Load environment variables
const ANILIST_API_URL = process.env.ANILIST_API_URL || 'https://graphql.anilist.co'

const DEV_PORT = 5173 // Vite dev server port
const SSR_PORT = 5174 // SSR server port

// Start Vite dev server in background using Bun
const viteProcess = Bun.spawn(['bun', 'run', 'dev', '--port', DEV_PORT.toString(), '--host'], {
  stdio: ['inherit', 'inherit', 'inherit']
})

// Give Vite time to start
const waitForVite = async () => {
  const maxRetries = 30
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`http://localhost:${DEV_PORT}/`)
      if (response.ok) {
        console.log(`Vite dev server running at http://localhost:${DEV_PORT}`)
        return
      }
    } catch (error) {
      // Vite not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error('Vite dev server failed to start')
}

// Wait for Vite to be ready
await waitForVite()

// Create SSR Vite instance for server-side module loading
const ssrVite: ViteDevServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
})

// Start SSR server that proxies assets to Vite dev server
Bun.serve({
  port: SSR_PORT,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Proxy API requests to AniList GraphQL endpoint
    if (pathname.startsWith('/api/graphql')) {
      try {
        const response = await fetch(ANILIST_API_URL, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'AniChart Dev Server/1.0'
          },
          body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined
        })

        // Get the response data and create a new response with proper headers
        const data = await response.text()
        return new Response(data, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        })
      } catch (error) {
        console.error('Error proxying API request:', error)
        return new Response(JSON.stringify({ error: 'API request failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Proxy static assets and HMR to Vite dev server
    if (
      pathname.startsWith('/@vite/') ||
      pathname.startsWith('/@fs/') ||
      pathname.startsWith('/src/') ||
      pathname.startsWith('/node_modules/') ||
      (pathname.includes('.') &&
        (pathname.endsWith('.js') ||
          pathname.endsWith('.ts') ||
          pathname.endsWith('.css') ||
          pathname.endsWith('.scss') ||
          pathname.endsWith('.sass') ||
          pathname.endsWith('.vue') ||
          pathname.endsWith('.json') ||
          pathname.endsWith('.map') ||
          pathname.endsWith('.woff') ||
          pathname.endsWith('.woff2') ||
          pathname.endsWith('.ttf') ||
          pathname.endsWith('.png') ||
          pathname.endsWith('.jpg') ||
          pathname.endsWith('.jpeg') ||
          pathname.endsWith('.gif') ||
          pathname.endsWith('.svg') ||
          pathname.endsWith('.ico')))
    ) {
      // Forward to Vite dev server
      try {
        const viteUrl = `http://localhost:${DEV_PORT}${pathname}${url.search}`
        const response = await fetch(viteUrl, {
          method: req.method,
          headers: req.headers,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined
        })
        return response
      } catch (error) {
        console.error('Error proxying to Vite:', error)
        return new Response('Asset not found', { status: 404 })
      }
    }

    // Handle SSR for page routes
    try {
      // Read template and transform it
      let template = await Bun.file('index.html').text()
      template = await ssrVite.transformIndexHtml(pathname, template)

      // Update template to point to Vite dev server for assets
      template = template.replace(
        'src="/src/entry-client.ts"',
        `src="http://localhost:${DEV_PORT}/src/entry-client.ts"`
      )

      // Also update CSS links to point to Vite dev server
      template = template.replace(
        'href="/src/assets/styles/anime.scss"',
        `href="http://localhost:${DEV_PORT}/src/assets/styles/anime.scss"`
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

console.log(`Unified SSR server running at http://localhost:${SSR_PORT} (powered by Bun)`)
console.log(`Proxying assets from Vite dev server at http://localhost:${DEV_PORT}`)
console.log(`Full HMR and SSR support in single command`)

// Handle process cleanup
process.on('exit', () => {
  viteProcess.kill()
})

process.on('SIGINT', () => {
  viteProcess.kill()
  process.exit(0)
})
