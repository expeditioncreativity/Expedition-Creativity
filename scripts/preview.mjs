import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
await import('./build.mjs');
const root = resolve('dist');
const portFlag=process.argv.indexOf('--port');
const port=Number(process.env.PORT || (portFlag>=0?process.argv[portFlag+1]:3000));
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.xml':'application/xml','.yml':'text/yaml'};
http.createServer(async (req,res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) throw Error('invalid path');
    if ((await stat(path)).isDirectory()) path += '/index.html';
    res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
    res.setHeader('X-Robots-Tag','noindex, nofollow');
    res.end(await readFile(path));
  } catch {res.writeHead(404);res.end('Pagina niet gevonden');}
}).listen(port, '0.0.0.0');
