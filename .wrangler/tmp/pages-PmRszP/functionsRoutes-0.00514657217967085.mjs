import { onRequestOptions as __api_delete_image_js_onRequestOptions } from "/Users/kang/Documents/Flow Studio/functions/api/delete-image.js"
import { onRequestPost as __api_delete_image_js_onRequestPost } from "/Users/kang/Documents/Flow Studio/functions/api/delete-image.js"
import { onRequestOptions as __api_import_js_onRequestOptions } from "/Users/kang/Documents/Flow Studio/functions/api/import.js"
import { onRequestPost as __api_import_js_onRequestPost } from "/Users/kang/Documents/Flow Studio/functions/api/import.js"
import { onRequestOptions as __api_upload_js_onRequestOptions } from "/Users/kang/Documents/Flow Studio/functions/api/upload.js"
import { onRequestPost as __api_upload_js_onRequestPost } from "/Users/kang/Documents/Flow Studio/functions/api/upload.js"
import { onRequest as ___middleware_js_onRequest } from "/Users/kang/Documents/Flow Studio/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/delete-image",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_delete_image_js_onRequestOptions],
    },
  {
      routePath: "/api/delete-image",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_delete_image_js_onRequestPost],
    },
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
      routePath: "/api/upload",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_upload_js_onRequestOptions],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_upload_js_onRequestPost],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]