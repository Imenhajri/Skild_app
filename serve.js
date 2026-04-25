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
  // Serve static files first
  const staticPath = join(clientDir, req.url.split('?')[0])
  if (existsSync(staticPath) && !staticPath.endsWith('/')) {
    const ext = extname(staticPath)
    const content = await readFile(staticPath)
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
    res.end(content)
    return
  }

  // Handle SSR - preserve full URL including query parameters
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers.host
  const fullUrl = `${protocol}://${host}${req.url}`

  // CRITICAL FIX: Add duplex option for Node.js 20
  const requestOptions = {
    method: req.method,
    headers: req.headers,
    duplex: 'half', // This line is REQUIRED
  }

  // Add body for non-GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    requestOptions.body = Buffer.concat(chunks)
  }

  try {
    const request = new Request(fullUrl, requestOptions)
    const response = await app.fetch(request)

    // Forward all headers (critical for Clerk cookies)
    const headers = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    res.writeHead(response.status, headers)
    const body = await response.arrayBuffer()
    res.end(Buffer.from(body))
  } catch (error) {
    console.error('Error handling request:', error)
    // Return a proper error page instead of crashing
    res.writeHead(500, { 'Content-Type': 'text/html' })
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Something went wrong</h1>
          <p>Please try again or contact support.</p>
        </body>
      </html>
    `)
  }
}).listen(port, () => {
  console.log(`Server running on port ${port}`)
})