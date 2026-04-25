import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import app from './dist/server/server.js'

const port = process.env.PORT || 3000
const clientDir = './dist/client'

const mimeTypes = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

createServer(async (req, res) => {
  // Try to serve static files first
  const staticPath = join(clientDir, req.url.split('?')[0])
  if (existsSync(staticPath) && !staticPath.endsWith('/')) {
    const ext = extname(staticPath)
    const content = await readFile(staticPath)
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
    res.end(content)
    return
  }

  // Fall through to SSR
  const url = `http://${req.headers.host}${req.url}`
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
  })
  const response = await app.fetch(request)
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(Buffer.from(await response.arrayBuffer()))
}).listen(port, () => {
  console.log(`Listening on http://0.0.0.0:${port}`)
})