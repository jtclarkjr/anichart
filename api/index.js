import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Import the built server bundle
const { render } = await import('../dist/server/entry-server.mjs')

// Read the built client HTML template
const template = await readFile(join(__dirname, '../dist/client/index.html'), 'utf-8')

// Content types mapping
const contentTypes = {
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

export default async function handler(req, res) {
  const { url } = req
  const pathname = new URL(url, `http://${req.headers.host}`).pathname

  // Serve static assets from dist/client
  if (pathname.startsWith('/assets/') || pathname.includes('.')) {
    try {
      const filePath = join(__dirname, '../dist/client', pathname)
      const file = await readFile(filePath)

      // Set appropriate content type based on file extension
      const ext = pathname.split('.').pop()

      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream')
      res.setHeader('Cache-Control', 'public, max-age=31536000') // 1 year cache for assets

      return res.end(file)
    } catch (error) {
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

    return res.end(responseHtml)
  } catch (error) {
    console.error('SSR Error:', error)
    res.status(500)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.end(`<h1>Server Error</h1><p>Something went wrong</p>`)
  }
}
