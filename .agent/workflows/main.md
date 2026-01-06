---
description: 推送到 main 分支并部署
---

1. Check if there are any uncommitted changes.
2. Add all changes: `git add .`
3. Commit with a detailed message (in Chinese): `git commit -m "update: [detailed description of changes]"`
4. Push to main branch: `git push origin main`
5. (Optional) Run build command if necessary for deployment checks: `npm run build`
6. Deploy to Cloudflare Pages (if strict auto-deploy is not set, otherwise the push triggers it): `npm run deploy` (or equivalent command if configured)
