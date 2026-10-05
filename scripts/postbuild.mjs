// Generates short links (spec §2, §6): /12 -> /o/vavstolen/
//  - out/_redirects: real 301s on Cloudflare Pages / Netlify (query string such as ?k=qr is kept)
//  - out/12/index.html: tiny fallback page for hosts without redirect support
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const outDir = path.join(root, 'out');
const contentDir = path.join(root, 'content', 'objekt');

const objects = fs
  .readdirSync(contentDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => matter(fs.readFileSync(path.join(contentDir, f), 'utf8')).data)
  .filter((d) => (d.sprak ?? 'sv') === 'sv');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const lines = [];
for (const { nummer, slug, titel } of objects) {
  const target = `/o/${slug}/`;
  lines.push(`/${nummer} ${target} 301`, `/${nummer}/ ${target} 301`);

  const dir = path.join(outDir, String(nummer));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    `<!doctype html>
<html lang="sv"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(titel)}</title>
<link rel="canonical" href="${target}">
<script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
<meta http-equiv="refresh" content="0;url=${target}">
</head><body><p><a href="${target}">${esc(nummer)}. ${esc(titel)}</a></p></body></html>
`,
  );
}

fs.writeFileSync(path.join(outDir, '_redirects'), lines.join('\n') + '\n');
console.log(`postbuild: ${objects.length} kortlänkar skrivna (_redirects + /<nr>/index.html)`);
