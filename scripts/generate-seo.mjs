import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [site, tools] = await Promise.all([
  readFile(path.join(root, 'src/config/site.data.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'src/config/tools.data.json'), 'utf8').then(JSON.parse),
]);

const routes = [
  '/',
  '/tools',
  ...site.categories.map((category) => `/category/${category.id}`),
  ...tools.map((tool) => tool.path),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${new URL(route, site.url).href}</loc>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/category') ? '0.7' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', site.url).href}
`;

await Promise.all([
  writeFile(path.join(root, 'public/sitemap.xml'), sitemap),
  writeFile(path.join(root, 'public/robots.txt'), robots),
]);

console.log(`Generated SEO files for ${routes.length} routes.`);
