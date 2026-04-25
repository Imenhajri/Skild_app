import { toNodeHandler } from 'h3-v2'
import { handler } from './dist/server/server.js'

const port = process.env.PORT || 3000

import { createServer } from 'node:http'
createServer(toNodeHandler(handler)).listen(port, () => {
  console.log(`Listening on http://0.0.0.0:${port}`)
})