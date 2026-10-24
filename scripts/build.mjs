import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, 'index.html'), resolve(output, 'index.html'));
await cp(resolve(root, 'src'), resolve(output, 'src'), { recursive: true });

const homepage = await stat(resolve(output, 'index.html'));
if (!homepage.isFile()) throw new Error('Missing static homepage');
console.log('Static Vercel output built at dist/');
