
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import seoConfig from '../seo-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = seoConfig.domain;
const DIST_DIR = path.join(__dirname, '../public'); // or '../dist' depending on when this runs. Usually public for vite.
// Actually, if we want it in the build, putting it in public is best.

if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
}

function generateSitemap() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    const routes = Object.keys(seoConfig.routes);

    routes.forEach(routePath => {
        // For each route, we generate an entry for each language? 
        // Or one entry per canonical URL with alternates?
        // Google recommends: One URL entry for each page version.

        seoConfig.languages.forEach(lang => {
            // Construct URL for this language version
            const isDefault = lang === seoConfig.defaultLanguage;
            const prefix = isDefault ? '' : `/${lang}`;
            // Handle root slash carefully
            const urlPath = (prefix + routePath).replace(/\/$/, '') || '/';
            // If result is empty string (case: default lang + root), make it '/'

            const loc = `${DOMAIN}${urlPath === '/' ? '' : urlPath}`;

            sitemap += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`;

            // Add xhtml:link for all alternates including itself
            seoConfig.languages.forEach(altLang => {
                const altIsDefault = altLang === seoConfig.defaultLanguage;
                const altPrefix = altIsDefault ? '' : `/${altLang}`;
                const altUrlPath = (altPrefix + routePath).replace(/\/$/, '') || '/';
                const altHref = `${DOMAIN}${altUrlPath === '/' ? '' : altUrlPath}`;

                sitemap += `
    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altHref}" />`;
            });

            // x-default
            const xDefaultUrlPath = routePath.replace(/\/$/, '') || '/';
            const xDefaultHref = `${DOMAIN}${xDefaultUrlPath === '/' ? '' : xDefaultUrlPath}`;
            sitemap += `
    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`;

            sitemap += `
  </url>`;
        });
    });

    sitemap += `
</urlset>`;

    const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`Sitemap generated at ${sitemapPath}`);
}

generateSitemap();
