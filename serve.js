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

  // Fall through to SSR - preserve the full URL with query parameters
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers.host
  const fullUrl = `${protocol}://${host}${req.url}`

  const request = new Request(fullUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
  })

  const response = await app.fetch(request)

  // Forward all headers including Set-Cookie
  const headers = {}
  response.headers.forEach((value, key) => {
    headers[key] = value
  })

  res.writeHead(response.status, headers)

  // Handle the response body properly
  const body = await response.arrayBuffer()
  res.end(Buffer.from(body))
}).listen(port, () => {
  console.log(`Server running on port ${port}`)
})