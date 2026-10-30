import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const SITE = 'sohba/site', ORIGIN = 'https://www.ma3elsahaba.com', LOCAL = 'http://localhost:8765';
const base = fs.readFileSync(`${SITE}/index.html`, 'utf8');
const esc = s => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const g = { window: {} }; new Function('window', fs.readFileSync('sohba/data.js','utf8'))(g.window); new Function('window', fs.readFileSync('sohba/v2/ten.js','utf8'))(g.window);
const L = g.window.LESSONS.filter(l => l.video);
const keys = ['home','about','sifat','map', ...L.map(l => l.id)];
const pathOf = k => k === 'home' ? '/' : `/${k}/`;
const person = { "@type": "Person", "name": "مصطفى خالد", "alternateName": "Mustafa Khaled", "url": "https://www.youtube.com/channel/UCqHueXazVReJWcYdcL5TI8A" };
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const urls = [];
for (const k of keys) {
  await p.goto(`${LOCAL}/#${k}`); await p.waitForTimeout(k === 'map' ? 300 : 900);
  const r = await p.evaluate((k) => ({ t: document.title, d: document.querySelector('meta[name="description"]')?.content || '', v: k === 'map' ? '' : document.getElementById('view').innerHTML }), k);
  const l = L.find(x => x.id === k), url = ORIGIN + pathOf(k);
  const desc = r.d || '';
  const img = l ? `https://i.ytimg.com/vi/${(l.parts && l.parts[0] && l.parts[0].video) || l.video}/hqdefault.jpg` : `${ORIGIN}/og.jpg`;
  const ld = [];
  if (k === 'home') ld.push({ "@context": "https://schema.org", "@type": "WebSite", "name": "مع الصحابة", "alternateName": ["Ma3 El Sahaba", "Ma3elsahaba", "Ma3 Elsahaba", "Maa Al Sahaba", "With the Sahaba", "With the Companions", "مع الصحابه", "ma3elsahaba.com"], "url": ORIGIN + '/', "inLanguage": "ar", "description": desc, "author": person },
    { "@context": "https://schema.org", "@type": "ItemList", "name": "حلقات مع الصحابة", "itemListElement": L.map((x, i) => ({ "@type": "ListItem", "position": i + 1, "name": x.name, "url": ORIGIN + pathOf(x.id) })) });
  else ld.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "مع الصحابة", "item": ORIGIN + '/' }, { "@type": "ListItem", "position": 2, "name": l ? l.name : r.t.split(' | ')[0], "item": url }] });
  const seo = `<title>${esc(r.t)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:site_name" content="مع الصحابة"><meta property="og:locale" content="ar_AR"><meta property="og:type" content="${l ? 'article' : 'website'}">
<meta property="og:title" content="${esc(r.t)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(r.t)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${img}">
${ld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}`;
  let html = base.replace('<meta name="description" content="">\n<!--SEO-->\n<title>مع الصحابة</title>', seo);
  if (html === base) throw new Error('SEO marker missing');
  if (r.v) html = html.replace('<main id="view"></main>', `<main id="view">${r.v}</main>`);
  html = html.replace(/href="#([a-z-]+)"/g, (m, x) => keys.includes(x) ? `href="${pathOf(x)}"` : m);
  const out = k === 'home' ? `${SITE}/index.html` : `${SITE}/${k}/index.html`;
  fs.mkdirSync(out.replace(/\/index\.html$/, ''), { recursive: true });
  fs.writeFileSync(k === 'home' ? `${SITE}/.home.html` : out, html);
  urls.push(url); console.log(k, r.t, r.v.length);
}
await b.close();
fs.renameSync(`${SITE}/.home.html`, `${SITE}/index.html`);
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(`${SITE}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(`${SITE}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
