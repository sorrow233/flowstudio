var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _middleware.js
var seoConfig = {
  siteUrl: "https://flowstudio.catzz.work",
  defaultLang: "zh",
  supportedLangs: ["zh", "en", "ja", "ko"],
  site: {
    zh: {
      name: "Flow Studio",
      defaultTitle: "Flow Studio | AI \u539F\u751F\u5F00\u53D1\u73AF\u5883",
      defaultDescription: "\u4F7F\u7528 Flow Studio \u7F16\u6392\u60A8\u7684 AI \u5F00\u53D1\u5DE5\u4F5C\u6D41\u3002\u4ECE\u7075\u611F\u5230\u90E8\u7F72\uFF0C\u5168\u7A0B\u966A\u4F34\u3002"
    },
    en: {
      name: "Flow Studio",
      defaultTitle: "Flow Studio | AI-Native Development Environment",
      defaultDescription: "Orchestrate your AI development workflow with Flow Studio. From inspiration to deployment."
    },
    ja: {
      name: "Flow Studio",
      defaultTitle: "Flow Studio | AI\u30CD\u30A4\u30C6\u30A3\u30D6\u958B\u767A\u74B0\u5883",
      defaultDescription: "Flow Studio\u3067 AI \u958B\u767A\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3092\u7DE8\u6210\u3002\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3\u304B\u3089\u30C7\u30D7\u30ED\u30A4\u307E\u3067\u3002"
    },
    ko: {
      name: "Flow Studio",
      defaultTitle: "Flow Studio | AI \uB124\uC774\uD2F0\uBE0C \uAC1C\uBC1C \uD658\uACBD",
      defaultDescription: "Flow Studio\uB85C AI \uAC1C\uBC1C \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC870\uC728\uD558\uC138\uC694. \uC601\uAC10\uBD80\uD130 \uBC30\uD3EC\uAE4C\uC9C0."
    }
  },
  pages: {
    "/": {
      zh: { title: "Flow Studio | AI \u539F\u751F\u5F00\u53D1\u73AF\u5883", description: "\u4F7F\u7528 Flow Studio \u7F16\u6392\u60A8\u7684 AI \u5F00\u53D1\u5DE5\u4F5C\u6D41\u3002\u4ECE\u7075\u611F\u6355\u6349\u5230\u5546\u4E1A\u5316\u90E8\u7F72\uFF0C\u4E3A\u5F00\u53D1\u8005\u63D0\u4F9B\u5B8C\u6574\u7684\u9879\u76EE\u751F\u547D\u5468\u671F\u7BA1\u7406\u3002" },
      en: { title: "Flow Studio | AI-Native Development Environment", description: "Orchestrate your AI development workflow with Flow Studio. Complete project lifecycle management from inspiration capture to commercial deployment." },
      ja: { title: "Flow Studio | AI\u30CD\u30A4\u30C6\u30A3\u30D6\u958B\u767A\u74B0\u5883", description: "Flow Studio\u3067AI\u958B\u767A\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3092\u7DE8\u6210\u3002\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3\u306E\u30AD\u30E3\u30D7\u30C1\u30E3\u304B\u3089\u5546\u7528\u30C7\u30D7\u30ED\u30A4\u307E\u3067\u3001\u5B8C\u5168\u306A\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u30E9\u30A4\u30D5\u30B5\u30A4\u30AF\u30EB\u7BA1\u7406\u3002" },
      ko: { title: "Flow Studio | AI \uB124\uC774\uD2F0\uBE0C \uAC1C\uBC1C \uD658\uACBD", description: "Flow Studio\uB85C AI \uAC1C\uBC1C \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC870\uC728\uD558\uC138\uC694. \uC601\uAC10 \uD3EC\uCC29\uC5D0\uC11C \uC0C1\uC6A9\uD654 \uBC30\uD3EC\uAE4C\uC9C0 \uC644\uC804\uD55C \uD504\uB85C\uC81D\uD2B8 \uB77C\uC774\uD504\uC0AC\uC774\uD074 \uAD00\uB9AC." }
    },
    "/inspiration": {
      zh: { title: "\u7075\u611F\u6355\u6349 | Flow Studio", description: "\u8BB0\u5F55\u77AC\u65F6\u7075\u611F\uFF0C\u4E3A\u672A\u6765\u79EF\u84C4\u521B\u610F\u80FD\u91CF\u3002Flow Studio \u7075\u611F\u6A21\u5757\u5E2E\u52A9\u60A8\u6355\u6349\u4E00\u95EA\u800C\u8FC7\u7684\u60F3\u6CD5\u3002" },
      en: { title: "Inspiration Capture | Flow Studio", description: "Capture fleeting ideas, fuel your creative energy. Flow Studio Inspiration module helps you record thoughts as they come." },
      ja: { title: "\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3 | Flow Studio", description: "\u77AC\u9593\u306E\u3072\u3089\u3081\u304D\u3092\u8A18\u9332\u3057\u3001\u672A\u6765\u306E\u30AF\u30EA\u30A8\u30A4\u30C6\u30A3\u30D6\u30A8\u30CD\u30EB\u30AE\u30FC\u3092\u84C4\u3048\u308B\u3002Flow Studio\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3\u30E2\u30B8\u30E5\u30FC\u30EB\u3002" },
      ko: { title: "\uC601\uAC10 \uD3EC\uCC29 | Flow Studio", description: "\uC21C\uAC04\uC801\uC778 \uC544\uC774\uB514\uC5B4\uB97C \uAE30\uB85D\uD558\uACE0 \uCC3D\uC758\uC801 \uC5D0\uB108\uC9C0\uB97C \uCD95\uC801\uD558\uC138\uC694. Flow Studio \uC601\uAC10 \uBAA8\uB4C8." }
    },
    "/pending": {
      zh: { title: "\u5F85\u5B9A\u9879\u76EE | Flow Studio", description: "\u7BA1\u7406\u7B49\u5F85\u542F\u52A8\u7684\u9879\u76EE\u6784\u601D\u3002\u4F7F\u7528 Flow Studio \u7684\u7075\u9B42\u56DB\u95EE\u9A8C\u8BC1\u9879\u76EE\u53EF\u884C\u6027\u3002" },
      en: { title: "Pending Projects | Flow Studio", description: "Manage project ideas awaiting kickoff. Validate project viability with Flow Studio Soul Questions." },
      ja: { title: "\u4FDD\u7559\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8 | Flow Studio", description: "\u30AD\u30C3\u30AF\u30AA\u30D5\u5F85\u3061\u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u30A2\u30A4\u30C7\u30A2\u3092\u7BA1\u7406\u3002Flow Studio\u306E\u9B42\u306E4\u3064\u306E\u8CEA\u554F\u3067\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306E\u5B9F\u884C\u53EF\u80FD\u6027\u3092\u691C\u8A3C\u3002" },
      ko: { title: "\uB300\uAE30 \uD504\uB85C\uC81D\uD2B8 | Flow Studio", description: "\uC2DC\uC791\uC744 \uAE30\uB2E4\uB9AC\uB294 \uD504\uB85C\uC81D\uD2B8 \uC544\uC774\uB514\uC5B4\uB97C \uAD00\uB9AC\uD558\uC138\uC694. Flow Studio \uC601\uD63C\uC758 \uC9C8\uBB38\uC73C\uB85C \uD504\uB85C\uC81D\uD2B8 \uC2E4\uD589 \uAC00\uB2A5\uC131\uC744 \uAC80\uC99D." }
    },
    "/primary": {
      zh: { title: "\u4E3B\u529B\u5F00\u53D1 | Flow Studio", description: "5 \u9636\u6BB5\u5F00\u53D1\u6D41\u7A0B\uFF1A\u9AA8\u67B6 \u2192 \u529F\u80FD \u2192 \u6A21\u5757 \u2192 \u4F18\u5316 \u2192 \u5B8C\u6210\u3002\u4EFB\u52A1\u7BA1\u7406\u4E0E\u8FDB\u5EA6\u8FFD\u8E2A\u5B8C\u7F8E\u7ED3\u5408\u3002" },
      en: { title: "Primary Development | Flow Studio", description: "5-stage development flow: Skeleton \u2192 Functionality \u2192 Modules \u2192 Optimization \u2192 Completion. Task management meets progress tracking." },
      ja: { title: "\u30E1\u30A4\u30F3\u958B\u767A | Flow Studio", description: "5\u6BB5\u968E\u306E\u958B\u767A\u30D5\u30ED\u30FC\uFF1A\u30B9\u30B1\u30EB\u30C8\u30F3 \u2192 \u6A5F\u80FD \u2192 \u30E2\u30B8\u30E5\u30FC\u30EB \u2192 \u6700\u9069\u5316 \u2192 \u5B8C\u6210\u3002\u30BF\u30B9\u30AF\u7BA1\u7406\u3068\u9032\u6357\u8FFD\u8DE1\u306E\u5B8C\u74A7\u306A\u878D\u5408\u3002" },
      ko: { title: "\uBA54\uC778 \uAC1C\uBC1C | Flow Studio", description: "5\uB2E8\uACC4 \uAC1C\uBC1C \uD50C\uB85C\uC6B0: \uC2A4\uCF08\uB808\uD1A4 \u2192 \uAE30\uB2A5 \u2192 \uBAA8\uB4C8 \u2192 \uCD5C\uC801\uD654 \u2192 \uC644\uB8CC. \uC791\uC5C5 \uAD00\uB9AC\uC640 \uC9C4\uD589 \uC0C1\uD669 \uCD94\uC801\uC758 \uC644\uBCBD\uD55C \uC870\uD654." }
    },
    "/advanced": {
      zh: { title: "\u8FDB\u9636\u5F00\u53D1 | Flow Studio", description: "\u590D\u6742\u7CFB\u7EDF\u67B6\u6784\u7BA1\u7406\u3002\u6A21\u5757\u5316\u8BBE\u8BA1\u3001\u4F9D\u8D56\u5173\u7CFB\u53EF\u89C6\u5316\u3001\u6280\u672F\u503A\u52A1\u8FFD\u8E2A\u3002" },
      en: { title: "Advanced Development | Flow Studio", description: "Complex system architecture management. Modular design, dependency visualization, technical debt tracking." },
      ja: { title: "\u9AD8\u5EA6\u306A\u958B\u767A | Flow Studio", description: "\u8907\u96D1\u306A\u30B7\u30B9\u30C6\u30E0\u30A2\u30FC\u30AD\u30C6\u30AF\u30C1\u30E3\u7BA1\u7406\u3002\u30E2\u30B8\u30E5\u30FC\u30EB\u8A2D\u8A08\u3001\u4F9D\u5B58\u95A2\u4FC2\u306E\u53EF\u8996\u5316\u3001\u6280\u8853\u7684\u8CA0\u50B5\u306E\u8FFD\u8DE1\u3002" },
      ko: { title: "\uACE0\uAE09 \uAC1C\uBC1C | Flow Studio", description: "\uBCF5\uC7A1\uD55C \uC2DC\uC2A4\uD15C \uC544\uD0A4\uD14D\uCC98 \uAD00\uB9AC. \uBAA8\uB4C8\uD654 \uC124\uACC4, \uC758\uC874\uC131 \uC2DC\uAC01\uD654, \uAE30\uC220 \uBD80\uCC44 \uCD94\uC801." }
    },
    "/final": {
      zh: { title: "\u7EC8\u7A3F\u5F00\u53D1 | Flow Studio", description: "\u9879\u76EE\u6700\u7EC8\u6253\u78E8\u9636\u6BB5\u3002\u6A21\u5757\u4F18\u5316\u3001\u65B0\u529F\u80FD\u8FFD\u52A0\u3001\u7F3A\u9677\u4FEE\u590D\u4E09\u9636\u6BB5\u7BA1\u7406\u3002" },
      en: { title: "Final Development | Flow Studio", description: "Project final polish stage. Three-phase management: optimization, feature additions, bug fixes." },
      ja: { title: "\u30D5\u30A1\u30A4\u30CA\u30EB\u958B\u767A | Flow Studio", description: "\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306E\u6700\u7D42\u30DD\u30EA\u30C3\u30B7\u30E5\u6BB5\u968E\u3002\u6700\u9069\u5316\u3001\u65B0\u6A5F\u80FD\u8FFD\u52A0\u3001\u30D0\u30B0\u4FEE\u6B63\u306E3\u30D5\u30A7\u30FC\u30BA\u7BA1\u7406\u3002" },
      ko: { title: "\uCD5C\uC885 \uAC1C\uBC1C | Flow Studio", description: "\uD504\uB85C\uC81D\uD2B8 \uCD5C\uC885 \uB9C8\uBB34\uB9AC \uB2E8\uACC4. \uCD5C\uC801\uD654, \uAE30\uB2A5 \uCD94\uAC00, \uBC84\uADF8 \uC218\uC815 3\uB2E8\uACC4 \uAD00\uB9AC." }
    },
    "/commercial": {
      zh: { title: "\u5546\u4E1A\u5316 | Flow Studio", description: "\u4ECE\u5F00\u53D1\u5230\u5E02\u573A\u3002\u5B9A\u4EF7\u7B56\u7565\u3001\u652F\u4ED8\u96C6\u6210\u3001\u8425\u9500\u6E20\u9053\u3001\u4E0A\u7EBF\u6E05\u5355\u4E00\u7AD9\u5F0F\u7BA1\u7406\u3002" },
      en: { title: "Commercialization | Flow Studio", description: "From development to market. Pricing strategy, payment integration, marketing channels, launch checklist - all in one place." },
      ja: { title: "\u5546\u696D\u5316 | Flow Studio", description: "\u958B\u767A\u304B\u3089\u5E02\u5834\u3078\u3002\u4FA1\u683C\u6226\u7565\u3001\u6C7A\u6E08\u7D71\u5408\u3001\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u30C1\u30E3\u30CD\u30EB\u3001\u30ED\u30FC\u30F3\u30C1\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8\u3092\u4E00\u5143\u7BA1\u7406\u3002" },
      ko: { title: "\uC0C1\uC6A9\uD654 | Flow Studio", description: "\uAC1C\uBC1C\uC5D0\uC11C \uC2DC\uC7A5\uC73C\uB85C. \uAC00\uACA9 \uC804\uB7B5, \uACB0\uC81C \uD1B5\uD569, \uB9C8\uCF00\uD305 \uCC44\uB110, \uCD9C\uC2DC \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \uC62C\uC778\uC6D0 \uAD00\uB9AC." }
    },
    "/commands": {
      zh: { title: "\u547D\u4EE4\u4E2D\u5FC3 | Flow Studio", description: "\u5F00\u53D1\u6D41\u7A0B\u4E2D\u7684\u5E38\u7528\u547D\u4EE4\u548C\u94FE\u63A5\u7BA1\u7406\u3002\u6309\u9636\u6BB5\u7EC4\u7EC7\uFF0C\u4E00\u952E\u590D\u5236\uFF0C\u63D0\u5347\u5F00\u53D1\u6548\u7387\u3002" },
      en: { title: "Command Center | Flow Studio", description: "Manage common commands and links in your dev workflow. Organized by stage, one-click copy, boost development efficiency." },
      ja: { title: "\u30B3\u30DE\u30F3\u30C9\u30BB\u30F3\u30BF\u30FC | Flow Studio", description: "\u958B\u767A\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u5185\u306E\u4E00\u822C\u7684\u306A\u30B3\u30DE\u30F3\u30C9\u3068\u30EA\u30F3\u30AF\u3092\u7BA1\u7406\u3002\u30B9\u30C6\u30FC\u30B8\u5225\u306B\u6574\u7406\u3001\u30EF\u30F3\u30AF\u30EA\u30C3\u30AF\u30B3\u30D4\u30FC\u3001\u958B\u767A\u52B9\u7387\u5411\u4E0A\u3002" },
      ko: { title: "\uCEE4\uB9E8\uB4DC \uC13C\uD130 | Flow Studio", description: "\uAC1C\uBC1C \uC6CC\uD06C\uD50C\uB85C\uC6B0\uC5D0\uC11C \uC790\uC8FC \uC0AC\uC6A9\uD558\uB294 \uBA85\uB839\uC5B4\uC640 \uB9C1\uD06C \uAD00\uB9AC. \uB2E8\uACC4\uBCC4 \uC815\uB9AC, \uC6D0\uD074\uB9AD \uBCF5\uC0AC\uB85C \uAC1C\uBC1C \uD6A8\uC728 \uD5A5\uC0C1." }
    }
  }
};
var CRAWLER_REGEX = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|ia_archiver|applebot|twitterbot|linkedinbot|pinterest|slackbot|whatsapp|telegrambot|discordbot/i;
function isCrawler(userAgent) {
  return CRAWLER_REGEX.test(userAgent || "");
}
__name(isCrawler, "isCrawler");
function extractLangFromPath(pathname) {
  const langMatch = pathname.match(/^\/(en|ja|ko)(\/.*)?$/);
  if (langMatch) {
    return {
      lang: langMatch[1],
      path: langMatch[2] || "/"
    };
  }
  return {
    lang: null,
    path: pathname
  };
}
__name(extractLangFromPath, "extractLangFromPath");
function parseAcceptLanguage(acceptLanguage) {
  if (!acceptLanguage) return null;
  const langMap = {
    "zh": "zh",
    "zh-cn": "zh",
    "zh-hans": "zh",
    "en": "en",
    "en-us": "en",
    "en-gb": "en",
    "ja": "ja",
    "ja-jp": "ja",
    "ko": "ko",
    "ko-kr": "ko"
  };
  const langs = acceptLanguage.toLowerCase().split(",");
  for (const lang of langs) {
    const code = lang.split(";")[0].trim();
    if (langMap[code]) {
      return langMap[code];
    }
    const prefix = code.split("-")[0];
    if (langMap[prefix]) {
      return langMap[prefix];
    }
  }
  return null;
}
__name(parseAcceptLanguage, "parseAcceptLanguage");
function getPageSeo(path, lang) {
  const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
  const pageConfig = seoConfig.pages[normalizedPath];
  if (!pageConfig) {
    const siteData = seoConfig.site[lang] || seoConfig.site[seoConfig.defaultLang];
    return {
      title: siteData.defaultTitle,
      description: siteData.defaultDescription
    };
  }
  return pageConfig[lang] || pageConfig[seoConfig.defaultLang];
}
__name(getPageSeo, "getPageSeo");
function getCanonicalUrl(path, lang) {
  const basePath = path === "/" ? "" : path;
  if (lang === seoConfig.defaultLang) {
    return `${seoConfig.siteUrl}${basePath}`;
  }
  return `${seoConfig.siteUrl}/${lang}${basePath}`;
}
__name(getCanonicalUrl, "getCanonicalUrl");
function generateHreflangTags(path) {
  const tags = [];
  for (const lang of seoConfig.supportedLangs) {
    tags.push(`<link rel="alternate" hreflang="${lang}" href="${getCanonicalUrl(path, lang)}" />`);
  }
  tags.push(`<link rel="alternate" hreflang="x-default" href="${getCanonicalUrl(path, seoConfig.defaultLang)}" />`);
  return tags.join("\n    ");
}
__name(generateHreflangTags, "generateHreflangTags");
function injectSeoTags(html, seoData, lang, path) {
  let modifiedHtml = html;
  modifiedHtml = modifiedHtml.replace(
    /<html\s+lang="[^"]*"/i,
    `<html lang="${lang}"`
  );
  modifiedHtml = modifiedHtml.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${seoData.title}</title>`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${seoData.description}" />`
  );
  const hreflangTags = generateHreflangTags(path);
  const canonicalUrl = getCanonicalUrl(path, lang);
  const additionalTags = `
    <!-- SEO Edge Injection -->
    <link rel="canonical" href="${canonicalUrl}" />
    ${hreflangTags}
    <meta property="og:title" content="${seoData.title}" />
    <meta property="og:description" content="${seoData.description}" />
    <meta property="og:locale" content="${lang === "zh" ? "zh_CN" : lang === "ja" ? "ja_JP" : lang === "ko" ? "ko_KR" : "en_US"}" />
    <meta name="twitter:title" content="${seoData.title}" />
    <meta name="twitter:description" content="${seoData.description}" />
`;
  modifiedHtml = modifiedHtml.replace("</head>", `${additionalTags}</head>`);
  return modifiedHtml;
}
__name(injectSeoTags, "injectSeoTags");
async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|mp4|webm)$/i)) {
    return next();
  }
  if (url.pathname.startsWith("/api/")) {
    return next();
  }
  if (url.pathname === "/sitemap.xml") {
    return next();
  }
  if (!isCrawler(userAgent)) {
    const { lang, path: path2 } = extractLangFromPath(url.pathname);
    if (lang) {
      const newUrl = new URL(request.url);
      newUrl.pathname = path2;
      return fetch(new Request(newUrl.toString(), request));
    }
    return next();
  }
  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }
  const { lang: urlLang, path } = extractLangFromPath(url.pathname);
  const detectedLang = urlLang || parseAcceptLanguage(acceptLanguage) || seoConfig.defaultLang;
  const seoData = getPageSeo(path, detectedLang);
  const html = await response.text();
  const modifiedHtml = injectSeoTags(html, seoData, detectedLang, path);
  return new Response(modifiedHtml, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      "content-type": "text/html; charset=utf-8",
      "x-seo-injected": "true",
      "x-seo-lang": detectedLang
    }
  });
}
__name(onRequest, "onRequest");

// ../.wrangler/tmp/pages-eAyEs8/functionsRoutes-0.3049517596739719.mjs
var routes = [
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest],
    modules: []
  }
];

// ../../../.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
