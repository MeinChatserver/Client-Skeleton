import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', 'dist', 'Angular', 'browser');
const port = process.env.PORT || 5001;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

if (!existsSync(root)) {
  console.error(`Build output not found: ${root}\nRun "npm run build" first.`);
  process.exit(1);
}

http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  // Bildet die echte Produktions-URL-Struktur nach: /client (lowercase) liefert
  // index.html, /Client/* (Prefix) liefert die restlichen Build-Dateien.
  if (urlPath === '/client' || urlPath === '/client/') {
    urlPath = '/index.html';
  } else if (urlPath.startsWith('/Client/')) {
    urlPath = urlPath.slice('/Client'.length);
  }

  let filePath = join(root, urlPath);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, 'index.html');
  }

  const ext = extname(filePath);
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(`Serving ${root}`);
  console.log(`  http://localhost:${port}/client -> index.html`);
  console.log(`  http://localhost:${port}/Client/* -> build output`);
});
