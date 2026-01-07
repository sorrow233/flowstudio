
import seoConfig from '../seo-config.js';

export async function onRequest(context) {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // 1. Skip static assets to avoid unnecessary processing
    // Common extensions for assets
    if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot)$/.test(url.pathname)) {
        return next();
    }

    // 2. Determine Language
    // Path prefixes: /en/, /ja/, /zh-CN/ etc.
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];

    let language = seoConfig.defaultLanguage;
    let routePath = url.pathname;

    // Check if first segment is a supported language
    if (seoConfig.languages.includes(firstSegment)) {
        language = firstSegment;
        // Normalize path to look up in config (remove lang prefix)
        // e.g. /ja/dashboard -> /dashboard
        // e.g. /ja -> /
        const remainingSegments = pathSegments.slice(1);
        routePath = '/' + remainingSegments.join('/');
    }

    // 3. Match Route in Config
    // Ensure we match exact or fallback to generic if complex
    const routeConfig = seoConfig.routes[routePath] || seoConfig.routes['/']; // Fallback to home metadata if route not found (better than nothing)

    if (!routeConfig && routePath !== '/') {
        // If it's a really unknown route, maybe just pass through or let React handle 404
        // But we still might want consistent title if possible.
        // For now, let's use the home fallback or generic default.
    }

    // Get metadata for the determined language
    const meta = routeConfig ? (routeConfig[language] || routeConfig[seoConfig.defaultLanguage]) : null;

    if (!meta) {
        return next(); // Should not happen given fallbacks
    }

    // 4. Fetch the original response (index.html)
    // We use `next()` to get the asset from KV (Cloudflare Pages default behavior)
    const response = await next();

    // If it's not a HTML response (e.g. 404 for asset), just return it
    if (!response.headers.get('content-type')?.includes('text/html')) {
        return response;
    }

    // 5. Inject Metadata using HTMLRewriter
    // Disable caching for HTML files to ensure users always get the latest version (and correct asset hashes)
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

    return new HTMLRewriter()
        .on('title', {
            element(element) {
                element.setInnerContent(meta.title);
            }
        })
        .on('meta[name="description"]', {
            element(element) {
                element.setAttribute('content', meta.description);
            }
        })
        .on('meta[name="keywords"]', {
            element(element) {
                if (meta.keywords) {
                    element.setAttribute('content', meta.keywords);
                }
            }
        })
        // OGP Tags
        .on('meta[property="og:title"]', {
            element(element) {
                element.setAttribute('content', meta.title);
            }
        })
        .on('meta[property="og:description"]', {
            element(element) {
                element.setAttribute('content', meta.description);
            }
        })
        // Inject Hreflang links
        .on('head', {
            append(element) {
                // Canonical (self)
                const canonicalUrl = `${seoConfig.domain}${language === seoConfig.defaultLanguage ? '' : '/' + language}${routePath === '/' ? '' : routePath}`;
                element.append(`<link rel="canonical" href="${canonicalUrl}" />`, { html: true });

                // Hreflang for all supported languages
                seoConfig.languages.forEach(lang => {
                    const href = `${seoConfig.domain}${lang === seoConfig.defaultLanguage ? '' : '/' + lang}${routePath === '/' ? '' : routePath}`;
                    element.append(`<link rel="alternate" hreflang="${lang}" href="${href}" />`, { html: true });
                });

                // x-default hreflang (usually maps to default lang)
                const xDefaultHref = `${seoConfig.domain}${routePath === '/' ? '' : routePath}`;
                element.append(`<link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`, { html: true });
            }
        })
        .transform(response);
}
