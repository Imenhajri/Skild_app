import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import app from './dist/server/server.js';

const port = process.env.PORT || 3000;
const clientDir = './dist/client';

const mimeTypes = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  // ... add other types as needed
};

createServer(async (req, res) => {
  // 1. Serve static files
  const staticPath = join(clientDir, req.url.split('?')[0]);
  if (existsSync(staticPath) && !staticPath.endsWith('/')) {
    const ext = extname(staticPath);
    const content = await readFile(staticPath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
    return;
  }

  // 2. Handle SSR and API routes
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const fullUrl = `${protocol}://${host}${req.url}`;

  // *** CRITICAL FIX FOR NODE 20 ***
  const requestOptions = {
    method: req.method,
    headers: req.headers,
    duplex: 'half', // <-- THIS LINE IS REQUIRED
  };

  // Add body for non-GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    requestOptions.body = Buffer.concat(chunks);
  }

  try {
    const request = new Request(fullUrl, requestOptions);
    const response = await app.fetch(request);

    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    res.writeHead(response.status, headers);
    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (error) {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Server Error</h1><p>Please try again later.</p>');
  }
}).listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});