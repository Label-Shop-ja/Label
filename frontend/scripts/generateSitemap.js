// Generate sitemap.xml dynamically
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const generateSitemap = () => {
  console.log('🗺️  GENERATING SITEMAP\n');
  
  const baseUrl = 'https://label.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/dashboard', priority: '0.8', changefreq: 'weekly' },
    { path: '/dashboard/inventario', priority: '0.8', changefreq: 'weekly' },
    { path: '/dashboard/pos', priority: '0.8', changefreq: 'weekly' },
    { path: '/dashboard/finanzas', priority: '0.7', changefreq: 'weekly' },
    { path: '/dashboard/clientes', priority: '0.7', changefreq: 'weekly' },
    { path: '/dashboard/estadisticas', priority: '0.6', changefreq: 'weekly' },
    { path: '/dashboard/ajustes', priority: '0.5', changefreq: 'monthly' }
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  const sitemapPath = resolve('public', 'sitemap.xml');
  writeFileSync(sitemapPath, sitemap);
  
  console.log(`✅ Sitemap generated with ${routes.length} URLs`);
  console.log(`📍 Location: ${sitemapPath}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  
  // Generate robots.txt
  const robots = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /admin/
Disallow: /unauthorized

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1`;
  
  const robotsPath = resolve('public', 'robots.txt');
  writeFileSync(robotsPath, robots);
  
  console.log(`✅ Robots.txt generated`);
  console.log(`📍 Location: ${robotsPath}`);
  
  console.log('\n🎯 SEO files ready for production!');
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}

export default generateSitemap;