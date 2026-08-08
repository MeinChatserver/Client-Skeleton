import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = join(__dirname, '..', 'dist', 'Angular', 'browser');
const destination = join(__dirname, '..', '..', '..', 'Client');

if (!existsSync(source)) {
  console.error(`Build output not found: ${source}\nRun "npm run build" first.`);
  process.exit(1);
}

if (!existsSync(destination)) {
  console.error(`Destination not found: ${destination}`);
  process.exit(1);
}

cpSync(source, destination, { recursive: true, force: true });
rmSync(source, { recursive: true, force: true });

console.log(`Moved build output:\n  ${source}\n  -> ${destination}`);
