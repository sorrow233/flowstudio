import { onRequestOptions as __api_import_js_onRequestOptions } from "/Users/kang/Documents/Flow Studio/functions/api/import.js"
import { onRequestPost as __api_import_js_onRequestPost } from "/Users/kang/Documents/Flow Studio/functions/api/import.js"
import { onRequest as ___middleware_js_onRequest } from "/Users/kang/Documents/Flow Studio/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/import",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_import_js_onRequestOptions],
    },
  {
      routePath: "/api/import",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_import_js_onRequestPost],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]