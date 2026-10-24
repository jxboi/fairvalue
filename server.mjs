import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname);
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    const path = resolve(root,'.'+decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (path !== root && !path.startsWith(root+sep)) {res.writeHead(403); return res.end('Forbidden');}
    if (path.split(sep).some(segment=>segment.startsWith('.')) && path !== resolve(root,'index.html')) {res.writeHead(403);return res.end('Forbidden');}
    if (!(await stat(path)).isFile()) throw new Error('Not a file');
    res.writeHead(200,{'Content-Type':(mime[extname(path)]||'text/plain')+'; charset=utf-8','X-Content-Type-Options':'nosniff'});
    res.end(await readFile(path));
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('fairvalue → http://localhost:4173'));
