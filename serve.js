import { createServer } from 'node:http'
import app from './dist/server/server.js'

const port = process.env.PORT || 3000

createServer(async (req, res) => {
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