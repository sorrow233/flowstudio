var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-4xPopn/functionsWorker-0.6944513985006073.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
async function signRequest(method, url, headers, body, credentials) {
  const { accessKeyId, secretAccessKey, region = "auto" } = credentials;
  const service = "s3";
  const now = /* @__PURE__ */ new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const urlObj = new URL(url);
  const canonicalUri = urlObj.pathname;
  const canonicalQueryString = urlObj.search.slice(1);
  headers["x-amz-date"] = amzDate;
  headers["x-amz-content-sha256"] = body ? await sha256Hex(body) : "UNSIGNED-PAYLOAD";
  headers["host"] = urlObj.host;
  const signedHeadersList = Object.keys(headers).filter((k) => k.toLowerCase().startsWith("x-amz-") || k.toLowerCase() === "host" || k.toLowerCase() === "content-type").sort();
  const canonicalHeaders = signedHeadersList.map((k) => `${k.toLowerCase()}:${headers[k].trim()}`).join("\n") + "\n";
  const signedHeaders = signedHeadersList.map((k) => k.toLowerCase()).join(";");
  const payloadHash = headers["x-amz-content-sha256"];
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest)
  ].join("\n");
  const kDate = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  const signature = await hmacSha256Hex(kSigning, stringToSign);
  headers["Authorization"] = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return headers;
}
__name(signRequest, "signRequest");
__name2(signRequest, "signRequest");
async function sha256Hex(data) {
  const encoder = new TextEncoder();
  const dataBuffer = typeof data === "string" ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
__name2(sha256Hex, "sha256Hex");
async function hmacSha256(key, data) {
  const encoder = new TextEncoder();
  const keyBuffer = typeof key === "string" ? encoder.encode(key) : key;
  const dataBuffer = typeof data === "string" ? encoder.encode(data) : data;
  const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer));
}
__name(hmacSha256, "hmacSha256");
__name2(hmacSha256, "hmacSha256");
async function hmacSha256Hex(key, data) {
  const result = await hmacSha256(key, data);
  return Array.from(result).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmacSha256Hex, "hmacSha256Hex");
__name2(hmacSha256Hex, "hmacSha256Hex");
async function onRequestPost(context) {
  const { request, env } = context;
  try {
    let r2Config;
    try {
      r2Config = JSON.parse(env.R2_CONFIG || "{}");
    } catch {
      return new Response(JSON.stringify({ error: "Invalid R2_CONFIG" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const { accessKeyId, secretAccessKey, bucket, endpoint, publicUrl } = r2Config;
    if (!accessKeyId || !secretAccessKey || !bucket || !endpoint || !publicUrl) {
      return new Response(JSON.stringify({ error: "Missing R2 configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const whitelist = (env.UPLOAD_WHITELIST || "").split(",").map((s) => s.trim()).filter(Boolean);
    const authHeader = request.headers.get("Authorization") || "";
    const userId = authHeader.replace("Bearer ", "").trim();
    if (!userId || !whitelist.includes(userId)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { url } = body;
    if (!url) {
      return new Response(JSON.stringify({ error: "No URL provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const urlPath = url.replace(publicUrl, "").replace(/^\//, "");
    if (!urlPath || !urlPath.startsWith("inspiration/")) {
      return new Response(JSON.stringify({ error: "Invalid image URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const deleteUrl = `${endpoint}/${bucket}/${urlPath}`;
    const headers = {};
    const signedHeaders = await signRequest("DELETE", deleteUrl, headers, null, {
      accessKeyId,
      secretAccessKey
    });
    const deleteResponse = await fetch(deleteUrl, {
      method: "DELETE",
      headers: signedHeaders
    });
    if (!deleteResponse.ok && deleteResponse.status !== 204) {
      const errorText = await deleteResponse.text();
      console.error("R2 delete failed:", errorText);
      return new Response(JSON.stringify({ error: "Delete failed", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      deleted: urlPath
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Delete API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}
__name(onRequestOptions, "onRequestOptions");
__name2(onRequestOptions, "onRequestOptions");
var FIREBASE_PROJECT_ID = "flow-7ffad";
var corsHeaders2 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
async function onRequestPost2({ request }) {
  try {
    const data = await request.json();
    const { text, userId, source } = data;
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400,
        headers: { ...corsHeaders2, "Content-Type": "application/json" }
      });
    }
    if (!userId) {
      const redirectUrl = `https://flowstudio.catzz.work/inspiration?import_text=${encodeURIComponent(text)}`;
      return new Response(JSON.stringify({
        success: true,
        method: "redirect",
        message: "No userId provided, falling back to redirect",
        redirectUrl
      }), {
        headers: { ...corsHeaders2, "Content-Type": "application/json" }
      });
    }
    const importId = `import_${Date.now()}`;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${userId}/pending_imports/${importId}`;
    const firestoreDoc = {
      fields: {
        text: { stringValue: text },
        source: { stringValue: source || "external" },
        createdAt: { integerValue: Date.now().toString() }
      }
    };
    const firestoreResponse = await fetch(firestoreUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firestoreDoc)
    });
    if (!firestoreResponse.ok) {
      const errorData = await firestoreResponse.json();
      console.error("Firestore write failed:", errorData);
      const redirectUrl = `https://flowstudio.catzz.work/inspiration?import_text=${encodeURIComponent(text)}`;
      return new Response(JSON.stringify({
        success: true,
        method: "redirect",
        message: "Queue write failed, falling back to redirect",
        error: errorData.error?.message || "Unknown Firestore error",
        redirectUrl
      }), {
        headers: { ...corsHeaders2, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      method: "queue",
      message: "Content queued successfully",
      importId
    }), {
      headers: { ...corsHeaders2, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Import API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders2, "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestOptions2() {
  return new Response(null, { headers: corsHeaders2 });
}
__name(onRequestOptions2, "onRequestOptions2");
__name2(onRequestOptions2, "onRequestOptions");
var corsHeaders3 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
async function signRequest2(method, url, headers, body, credentials) {
  const { accessKeyId, secretAccessKey, region = "auto" } = credentials;
  const service = "s3";
  const now = /* @__PURE__ */ new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const urlObj = new URL(url);
  const canonicalUri = urlObj.pathname;
  const canonicalQueryString = urlObj.search.slice(1);
  headers["x-amz-date"] = amzDate;
  headers["x-amz-content-sha256"] = body ? await sha256Hex2(body) : "UNSIGNED-PAYLOAD";
  headers["host"] = urlObj.host;
  const signedHeadersList = Object.keys(headers).filter((k) => k.toLowerCase().startsWith("x-amz-") || k.toLowerCase() === "host" || k.toLowerCase() === "content-type").sort();
  const canonicalHeaders = signedHeadersList.map((k) => `${k.toLowerCase()}:${headers[k].trim()}`).join("\n") + "\n";
  const signedHeaders = signedHeadersList.map((k) => k.toLowerCase()).join(";");
  const payloadHash = headers["x-amz-content-sha256"];
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex2(canonicalRequest)
  ].join("\n");
  const kDate = await hmacSha2562(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmacSha2562(kDate, region);
  const kService = await hmacSha2562(kRegion, service);
  const kSigning = await hmacSha2562(kService, "aws4_request");
  const signature = await hmacSha256Hex2(kSigning, stringToSign);
  headers["Authorization"] = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return headers;
}
__name(signRequest2, "signRequest2");
__name2(signRequest2, "signRequest");
async function sha256Hex2(data) {
  const encoder = new TextEncoder();
  const dataBuffer = typeof data === "string" ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex2, "sha256Hex2");
__name2(sha256Hex2, "sha256Hex");
async function hmacSha2562(key, data) {
  const encoder = new TextEncoder();
  const keyBuffer = typeof key === "string" ? encoder.encode(key) : key;
  const dataBuffer = typeof data === "string" ? encoder.encode(data) : data;
  const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer));
}
__name(hmacSha2562, "hmacSha2562");
__name2(hmacSha2562, "hmacSha256");
async function hmacSha256Hex2(key, data) {
  const result = await hmacSha2562(key, data);
  return Array.from(result).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmacSha256Hex2, "hmacSha256Hex2");
__name2(hmacSha256Hex2, "hmacSha256Hex");
function generateFileName(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `inspiration/${timestamp}-${random}.${ext}`;
}
__name(generateFileName, "generateFileName");
__name2(generateFileName, "generateFileName");
async function onRequestPost3(context) {
  const { request, env } = context;
  try {
    let r2Config;
    try {
      r2Config = JSON.parse(env.R2_CONFIG || "{}");
    } catch {
      return new Response(JSON.stringify({ error: "Invalid R2_CONFIG" }), {
        status: 500,
        headers: { ...corsHeaders3, "Content-Type": "application/json" }
      });
    }
    const { accessKeyId, secretAccessKey, bucket, endpoint, publicUrl } = r2Config;
    if (!accessKeyId || !secretAccessKey || !bucket || !endpoint || !publicUrl) {
      return new Response(JSON.stringify({ error: "Missing R2 configuration" }), {
        status: 500,
        headers: { ...corsHeaders3, "Content-Type": "application/json" }
      });
    }
    const whitelist = (env.UPLOAD_WHITELIST || "").split(",").map((s) => s.trim()).filter(Boolean);
    const authHeader = request.headers.get("Authorization") || "";
    const userId = authHeader.replace("Bearer ", "").trim();
    if (!userId || !whitelist.includes(userId)) {
      return new Response(JSON.stringify({ error: "Unauthorized: User not in whitelist" }), {
        status: 403,
        headers: { ...corsHeaders3, "Content-Type": "application/json" }
      });
    }
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { ...corsHeaders3, "Content-Type": "application/json" }
      });
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Invalid file type. Only images allowed." }), {
        status: 400,
        headers: { ...corsHeaders3, "Content-Type": "application/json" }
      });
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: "File too large. Max 10MB." }), {
        status: 400,
        headers: { ...corsHeaders3, "Content-Type": "application/json" }
      });
    }
    const fileName = generateFileName(file.name);
    const fileBuffer = await file.arrayBuffer();
    const uploadUrl = `${endpoint}/${bucket}/${fileName}`;
    const headers = {
      "Content-Type": file.type,
      "Content-Length": file.size.toString()
    };
    const signedHeaders = await signRequest2("PUT", uploadUrl, headers, new Uint8Array(fileBuffer), {
      accessKeyId,
      secretAccessKey
    });
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: signedHeaders,
      body: fileBuffer
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("R2 upload failed:", errorText);
      return new Response(JSON.stringify({ error: "Upload to R2 failed", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders3, "Content-Type": "application/json" }
      });
    }
    const imageUrl = `${publicUrl}/${fileName}`;
    return new Response(JSON.stringify({
      success: true,
      url: imageUrl,
      fileName
    }), {
      headers: { ...corsHeaders3, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders3, "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequestOptions3() {
  return new Response(null, { headers: corsHeaders3 });
}
__name(onRequestOptions3, "onRequestOptions3");
__name2(onRequestOptions3, "onRequestOptions");
var seoConfig = {
  // 生产环境 URL
  siteUrl: "https://flowstudio.catzz.work",
  // 默认语言 (不添加 URL 前缀)
  defaultLang: "zh",
  // 支持的语言列表
  supportedLangs: ["zh", "en", "ja", "ko"],
  // 语言名称映射 (用于语言切换器)
  langNames: {
    zh: "\u7B80\u4F53\u4E2D\u6587",
    en: "English",
    ja: "\u65E5\u672C\u8A9E",
    ko: "\uD55C\uAD6D\uC5B4"
  },
  // 全局站点元数据
  site: {
    zh: {
      name: "Flow Studio",
      tagline: "AI \u539F\u751F\u5F00\u53D1\u73AF\u5883",
      defaultTitle: "Flow Studio | AI \u539F\u751F\u5F00\u53D1\u73AF\u5883",
      defaultDescription: "\u4F7F\u7528 Flow Studio \u7F16\u6392\u60A8\u7684 AI \u5F00\u53D1\u5DE5\u4F5C\u6D41\u3002\u4ECE\u7075\u611F\u5230\u90E8\u7F72\uFF0C\u5168\u7A0B\u966A\u4F34\u3002"
    },
    en: {
      name: "Flow Studio",
      tagline: "AI-Native Development Environment",
      defaultTitle: "Flow Studio | AI-Native Development Environment",
      defaultDescription: "Orchestrate your AI development workflow with Flow Studio. From inspiration to deployment."
    },
    ja: {
      name: "Flow Studio",
      tagline: "AI\u30CD\u30A4\u30C6\u30A3\u30D6\u958B\u767A\u74B0\u5883",
      defaultTitle: "Flow Studio | AI\u30CD\u30A4\u30C6\u30A3\u30D6\u958B\u767A\u74B0\u5883",
      defaultDescription: "Flow Studio\u3067 AI \u958B\u767A\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3092\u7DE8\u6210\u3002\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3\u304B\u3089\u30C7\u30D7\u30ED\u30A4\u307E\u3067\u3002"
    },
    ko: {
      name: "Flow Studio",
      tagline: "AI \uB124\uC774\uD2F0\uBE0C \uAC1C\uBC1C \uD658\uACBD",
      defaultTitle: "Flow Studio | AI \uB124\uC774\uD2F0\uBE0C \uAC1C\uBC1C \uD658\uACBD",
      defaultDescription: "Flow Studio\uB85C AI \uAC1C\uBC1C \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC870\uC728\uD558\uC138\uC694. \uC601\uAC10\uBD80\uD130 \uBC30\uD3EC\uAE4C\uC9C0."
    }
  },
  // 页面级 SEO 配置
  pages: {
    "/": {
      zh: {
        title: "Flow Studio | AI \u539F\u751F\u5F00\u53D1\u73AF\u5883",
        description: "\u4F7F\u7528 Flow Studio \u7F16\u6392\u60A8\u7684 AI \u5F00\u53D1\u5DE5\u4F5C\u6D41\u3002\u4ECE\u7075\u611F\u6355\u6349\u5230\u5546\u4E1A\u5316\u90E8\u7F72\uFF0C\u4E3A\u5F00\u53D1\u8005\u63D0\u4F9B\u5B8C\u6574\u7684\u9879\u76EE\u751F\u547D\u5468\u671F\u7BA1\u7406\u3002"
      },
      en: {
        title: "Flow Studio | AI-Native Development Environment",
        description: "Orchestrate your AI development workflow with Flow Studio. Complete project lifecycle management from inspiration capture to commercial deployment."
      },
      ja: {
        title: "Flow Studio | AI\u30CD\u30A4\u30C6\u30A3\u30D6\u958B\u767A\u74B0\u5883",
        description: "Flow Studio\u3067AI\u958B\u767A\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3092\u7DE8\u6210\u3002\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3\u306E\u30AD\u30E3\u30D7\u30C1\u30E3\u304B\u3089\u5546\u7528\u30C7\u30D7\u30ED\u30A4\u307E\u3067\u3001\u5B8C\u5168\u306A\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u30E9\u30A4\u30D5\u30B5\u30A4\u30AF\u30EB\u7BA1\u7406\u3002"
      },
      ko: {
        title: "Flow Studio | AI \uB124\uC774\uD2F0\uBE0C \uAC1C\uBC1C \uD658\uACBD",
        description: "Flow Studio\uB85C AI \uAC1C\uBC1C \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC870\uC728\uD558\uC138\uC694. \uC601\uAC10 \uD3EC\uCC29\uC5D0\uC11C \uC0C1\uC6A9\uD654 \uBC30\uD3EC\uAE4C\uC9C0 \uC644\uC804\uD55C \uD504\uB85C\uC81D\uD2B8 \uB77C\uC774\uD504\uC0AC\uC774\uD074 \uAD00\uB9AC."
      }
    },
    "/inspiration": {
      zh: {
        title: "\u7075\u611F\u6355\u6349 | Flow Studio",
        description: "\u8BB0\u5F55\u77AC\u65F6\u7075\u611F\uFF0C\u4E3A\u672A\u6765\u79EF\u84C4\u521B\u610F\u80FD\u91CF\u3002Flow Studio \u7075\u611F\u6A21\u5757\u5E2E\u52A9\u60A8\u6355\u6349\u4E00\u95EA\u800C\u8FC7\u7684\u60F3\u6CD5\u3002"
      },
      en: {
        title: "Inspiration Capture | Flow Studio",
        description: "Capture fleeting ideas, fuel your creative energy. Flow Studio Inspiration module helps you record thoughts as they come."
      },
      ja: {
        title: "\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3 | Flow Studio",
        description: "\u77AC\u9593\u306E\u3072\u3089\u3081\u304D\u3092\u8A18\u9332\u3057\u3001\u672A\u6765\u306E\u30AF\u30EA\u30A8\u30A4\u30C6\u30A3\u30D6\u30A8\u30CD\u30EB\u30AE\u30FC\u3092\u84C4\u3048\u308B\u3002Flow Studio\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3\u30E2\u30B8\u30E5\u30FC\u30EB\u3002"
      },
      ko: {
        title: "\uC601\uAC10 \uD3EC\uCC29 | Flow Studio",
        description: "\uC21C\uAC04\uC801\uC778 \uC544\uC774\uB514\uC5B4\uB97C \uAE30\uB85D\uD558\uACE0 \uCC3D\uC758\uC801 \uC5D0\uB108\uC9C0\uB97C \uCD95\uC801\uD558\uC138\uC694. Flow Studio \uC601\uAC10 \uBAA8\uB4C8."
      }
    },
    "/inspiration/archive": {
      zh: {
        title: "\u7075\u611F\u5F52\u6863 | Flow Studio",
        description: "\u67E5\u770B\u5386\u53F2\u7075\u611F\u8BB0\u5F55\uFF0C\u56DE\u987E\u521B\u610F\u5386\u7A0B\u3002"
      },
      en: {
        title: "Inspiration Archive | Flow Studio",
        description: "View inspiration history and review your creative journey."
      },
      ja: {
        title: "\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3\u30A2\u30FC\u30AB\u30A4\u30D6 | Flow Studio",
        description: "\u904E\u53BB\u306E\u30A4\u30F3\u30B9\u30D4\u30EC\u30FC\u30B7\u30E7\u30F3\u5C65\u6B74\u3092\u8868\u793A\u3057\u3001\u30AF\u30EA\u30A8\u30A4\u30C6\u30A3\u30D6\u306A\u65C5\u3092\u632F\u308A\u8FD4\u308B\u3002"
      },
      ko: {
        title: "\uC601\uAC10 \uBCF4\uAD00\uC18C | Flow Studio",
        description: "\uC601\uAC10 \uAE30\uB85D\uC744 \uD655\uC778\uD558\uACE0 \uCC3D\uC758\uC801\uC778 \uC5EC\uC815\uC744 \uB418\uB3CC\uC544\uBCF4\uC138\uC694."
      }
    },
    "/sprout": {
      zh: {
        title: "\u5F85\u5B9A\u9879\u76EE | Flow Studio",
        description: "\u7BA1\u7406\u7B49\u5F85\u542F\u52A8\u7684\u9879\u76EE\u6784\u601D\u3002\u4F7F\u7528 Flow Studio \u7684\u7075\u9B42\u56DB\u95EE\u9A8C\u8BC1\u9879\u76EE\u53EF\u884C\u6027\u3002"
      },
      en: {
        title: "Pending Projects | Flow Studio",
        description: "Manage project ideas awaiting kickoff. Validate project viability with Flow Studio Soul Questions."
      },
      ja: {
        title: "\u4FDD\u7559\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8 | Flow Studio",
        description: "\u30AD\u30C3\u30AF\u30AA\u30D5\u5F85\u3061\u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u30A2\u30A4\u30C7\u30A2\u3092\u7BA1\u7406\u3002Flow Studio\u306E\u9B42\u306E4\u3064\u306E\u8CEA\u554F\u3067\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u306E\u5B9F\u884C\u53EF\u80FD\u6027\u3092\u691C\u8A3C\u3002"
      },
      ko: {
        title: "\uB300\uAE30 \uD504\uB85C\uC81D\uD2B8 | Flow Studio",
        description: "\uC2DC\uC791\uC744 \uAE30\uB2E4\uB9AC\uB294 \uD504\uB85C\uC81D\uD2B8 \uC544\uC774\uB514\uC5B4\uB97C \uAD00\uB9AC\uD558\uC138\uC694. Flow Studio \uC601\uD63C\uC758 \uC9C8\uBB38\uC73C\uB85C \uD504\uB85C\uC81D\uD2B8 \uC2E4\uD589 \uAC00\uB2A5\uC131\uC744 \uAC80\uC99D."
      }
    },
    "/flow": {
      zh: {
        title: "\u4E3B\u529B\u5F00\u53D1 | Flow Studio",
        description: "5 \u9636\u6BB5\u5F00\u53D1\u6D41\u7A0B\uFF1A\u9AA8\u67B6 \u2192 \u529F\u80FD \u2192 \u6A21\u5757 \u2192 \u4F18\u5316 \u2192 \u5B8C\u6210\u3002\u4EFB\u52A1\u7BA1\u7406\u4E0E\u8FDB\u5EA6\u8FFD\u8E2A\u5B8C\u7F8E\u7ED3\u5408\u3002"
      },
      en: {
        title: "Primary Development | Flow Studio",
        description: "5-stage development flow: Skeleton \u2192 Functionality \u2192 Modules \u2192 Optimization \u2192 Completion. Task management meets progress tracking."
      },
      ja: {
        title: "\u30E1\u30A4\u30F3\u958B\u767A | Flow Studio",
        description: "5\u6BB5\u968E\u306E\u958B\u767A\u30D5\u30ED\u30FC\uFF1A\u30B9\u30B1\u30EB\u30C8\u30F3 \u2192 \u6A5F\u80FD \u2192 \u30E2\u30B8\u30E5\u30FC\u30EB \u2192 \u6700\u9069\u5316 \u2192 \u5B8C\u6210\u3002\u30BF\u30B9\u30AF\u7BA1\u7406\u3068\u9032\u6357\u8FFD\u8DE1\u306E\u5B8C\u74A7\u306A\u878D\u5408\u3002"
      },
      ko: {
        title: "\uBA54\uC778 \uAC1C\uBC1C | Flow Studio",
        description: "5\uB2E8\uACC4 \uAC1C\uBC1C \uD50C\uB85C\uC6B0: \uC2A4\uCF08\uB808\uD1A4 \u2192 \uAE30\uB2A5 \u2192 \uBAA8\uB4C8 \u2192 \uCD5C\uC801\uD654 \u2192 \uC644\uB8CC. \uC791\uC5C5 \uAD00\uB9AC\uC640 \uC9C4\uD589 \uC0C1\uD669 \uCD94\uC801\uC758 \uC644\uBCBD\uD55C \uC870\uD654."
      }
    },
    "/advanced": {
      zh: {
        title: "\u8FDB\u9636\u5F00\u53D1 | Flow Studio",
        description: "\u590D\u6742\u7CFB\u7EDF\u67B6\u6784\u7BA1\u7406\u3002\u6A21\u5757\u5316\u8BBE\u8BA1\u3001\u4F9D\u8D56\u5173\u7CFB\u53EF\u89C6\u5316\u3001\u6280\u672F\u503A\u52A1\u8FFD\u8E2A\u3002"
      },
      en: {
        title: "Advanced Development | Flow Studio",
        description: "Complex system architecture management. Modular design, dependency visualization, technical debt tracking."
      },
      ja: {
        title: "\u9AD8\u5EA6\u306A\u958B\u767A | Flow Studio",
        description: "\u8907\u96D1\u306A\u30B7\u30B9\u30C6\u30E0\u30A2\u30FC\u30AD\u30C6\u30AF\u30C1\u30E3\u7BA1\u7406\u3002\u30E2\u30B8\u30E5\u30FC\u30EB\u8A2D\u8A08\u3001\u4F9D\u5B58\u95A2\u4FC2\u306E\u53EF\u8996\u5316\u3001\u6280\u8853\u7684\u8CA0\u50B5\u306E\u8FFD\u8DE1\u3002"
      },
      ko: {
        title: "\uACE0\uAE09 \uAC1C\uBC1C | Flow Studio",
        description: "\uBCF5\uC7A1\uD55C \uC2DC\uC2A4\uD15C \uC544\uD0A4\uD14D\uCC98 \uAD00\uB9AC. \uBAA8\uB4C8\uD654 \uC124\uACC4, \uC758\uC874\uC131 \uC2DC\uAC01\uD654, \uAE30\uC220 \uBD80\uCC44 \uCD94\uC801."
      }
    },
    "/blueprint": {
      zh: {
        title: "\u547D\u4EE4\u4E2D\u5FC3 | Flow Studio",
        description: "\u5F00\u53D1\u6D41\u7A0B\u4E2D\u7684\u5E38\u7528\u547D\u4EE4\u548C\u94FE\u63A5\u7BA1\u7406\u3002\u6309\u9636\u6BB5\u7EC4\u7EC7\uFF0C\u4E00\u952E\u590D\u5236\uFF0C\u63D0\u5347\u5F00\u53D1\u6548\u7387\u3002"
      },
      en: {
        title: "Command Center | Flow Studio",
        description: "Manage common commands and links in your dev workflow. Organized by stage, one-click copy, boost development efficiency."
      },
      ja: {
        title: "\u30B3\u30DE\u30F3\u30C9\u30BB\u30F3\u30BF\u30FC | Flow Studio",
        description: "\u958B\u767A\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u5185\u306E\u4E00\u822C\u7684\u306A\u30B3\u30DE\u30F3\u30C9\u3068\u30EA\u30F3\u30AF\u3092\u7BA1\u7406\u3002\u30B9\u30C6\u30FC\u30B8\u5225\u306B\u6574\u7406\u3001\u30EF\u30F3\u30AF\u30EA\u30C3\u30AF\u30B3\u30D4\u30FC\u3001\u958B\u767A\u52B9\u7387\u5411\u4E0A\u3002"
      },
      ko: {
        title: "\uCEE4\uB9E8\uB4DC \uC13C\uD130 | Flow Studio",
        description: "\uAC1C\uBC1C \uC6CC\uD06C\uD50C\uB85C\uC6B0\uC5D0\uC11C \uC790\uC8FC \uC0AC\uC6A9\uD558\uB294 \uBA85\uB839\uC5B4\uC640 \uB9C1\uD06C \uAD00\uB9AC. \uB2E8\uACC4\uBCC4 \uC815\uB9AC, \uC6D0\uD074\uB9AD \uBCF5\uC0AC\uB85C \uAC1C\uBC1C \uD6A8\uC728 \uD5A5\uC0C1."
      }
    },
    "/data": {
      zh: {
        title: "\u6570\u636E\u4E2D\u5FC3 | Flow Studio",
        description: "\u7BA1\u7406\u60A8\u7684\u6570\u636E\u548C\u672C\u5730\u5907\u4EFD\u3002\u5BFC\u5165\u3001\u5BFC\u51FA\u548C\u6570\u636E\u6062\u590D\u3002"
      },
      en: {
        title: "Data Center | Flow Studio",
        description: "Manage your data and local backups. Import, export, and data recovery."
      },
      ja: {
        title: "\u30C7\u30FC\u30BF\u30BB\u30F3\u30BF\u30FC | Flow Studio",
        description: "\u30C7\u30FC\u30BF\u3068\u30ED\u30FC\u30AB\u30EB\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u306E\u7BA1\u7406\u3002\u30A4\u30F3\u30DD\u30FC\u30C8\u3001\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3001\u30C7\u30FC\u30BF\u5FA9\u5143\u3002"
      },
      ko: {
        title: "\uB370\uC774\uD130 \uC13C\uD130 | Flow Studio",
        description: "\uB370\uC774\uD130 \uBC0F \uB85C\uCEEC \uBC31\uC5C5 \uAD00\uB9AC. \uAC00\uC838\uC624\uAE30, \uB0B4\uBCF4\uB0B4\uAE30 \uBC0F \uB370\uC774\uD130 \uBCF5\uAD6C."
      }
    }
  },
  // 获取页面 SEO 数据的辅助函数
  getPageSeo(path, lang) {
    let normalizedPath = path;
    for (const l of this.supportedLangs) {
      if (path.startsWith("/" + l + "/") || path === "/" + l) {
        normalizedPath = path.substring(l.length + 1);
        if (!normalizedPath.startsWith("/")) normalizedPath = "/" + normalizedPath;
        break;
      }
    }
    if (normalizedPath === "") normalizedPath = "/";
    if (normalizedPath !== "/" && normalizedPath.endsWith("/")) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    const pageConfig = this.pages[normalizedPath];
    if (!pageConfig) {
      return this.site[lang] || this.site[this.defaultLang];
    }
    return pageConfig[lang] || pageConfig[this.defaultLang];
  },
  // 获取规范 URL
  getCanonicalUrl(path, lang) {
    let normalizedPath = path;
    for (const l of this.supportedLangs) {
      if (path.startsWith("/" + l + "/") || path === "/" + l) {
        normalizedPath = path.substring(l.length + 1);
        if (!normalizedPath.startsWith("/")) normalizedPath = "/" + normalizedPath;
        break;
      }
    }
    if (normalizedPath !== "/" && normalizedPath.endsWith("/")) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    if (lang === this.defaultLang) {
      return `${this.siteUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
    }
    return `${this.siteUrl}/${lang}${normalizedPath === "/" ? "" : normalizedPath}`;
  },
  // 获取所有语言的备用链接
  getAlternateLinks(path) {
    let normalizedPath = path;
    for (const l of this.supportedLangs) {
      if (path.startsWith("/" + l + "/") || path === "/" + l) {
        normalizedPath = path.substring(l.length + 1);
        if (!normalizedPath.startsWith("/")) normalizedPath = "/" + normalizedPath;
        break;
      }
    }
    if (normalizedPath !== "/" && normalizedPath.endsWith("/")) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    const links = [];
    for (const lang of this.supportedLangs) {
      let href;
      if (lang === this.defaultLang) {
        href = `${this.siteUrl}${normalizedPath === "/" ? "" : normalizedPath}`;
      } else {
        href = `${this.siteUrl}/${lang}${normalizedPath === "/" ? "" : normalizedPath}`;
      }
      links.push({
        hreflang: lang,
        href
      });
    }
    links.push({
      hreflang: "x-default",
      href: `${this.siteUrl}${normalizedPath === "/" ? "" : normalizedPath}`
    });
    return links;
  }
};
if (typeof module !== "undefined" && module.exports) {
  module.exports = seoConfig;
}
var seo_config_default = seoConfig;
async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|json|map|woff|woff2|ttf)$/)) {
    return context.next();
  }
  let lang = seo_config_default.defaultLang;
  for (const supportedLang of seo_config_default.supportedLangs) {
    if (path.startsWith(`/${supportedLang}/`) || path === `/${supportedLang}`) {
      lang = supportedLang;
      break;
    }
  }
  const seoData = seo_config_default.getPageSeo(path, lang);
  const canonical = seo_config_default.getCanonicalUrl(path, lang);
  const alternates = seo_config_default.getAlternateLinks(path);
  let response = await context.next();
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("text/html")) {
    return new HTMLRewriter().on("title", {
      element(e) {
        e.setInnerContent(seoData.title);
      }
    }).on('meta[name="description"]', {
      element(e) {
        e.setAttribute("content", seoData.description);
      }
    }).on("head", {
      element(e) {
        let tags = "";
        tags += `<link rel="canonical" href="${canonical}" />
`;
        alternates.forEach((link) => {
          tags += `<link rel="alternate" hreflang="${link.hreflang}" href="${link.href}" />
`;
        });
        tags += `<meta property="og:title" content="${seoData.title}" />
`;
        tags += `<meta property="og:description" content="${seoData.description}" />
`;
        tags += `<meta property="og:url" content="${canonical}" />
`;
        tags += `<meta property="og:site_name" content="${seo_config_default.site[lang].name}" />
`;
        tags += `<meta property="og:locale" content="${lang}" />
`;
        e.append(tags, { html: true });
      }
    }).on("html", {
      element(e) {
        e.setAttribute("lang", lang);
      }
    }).transform(response);
  }
  return response;
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
var routes = [
  {
    routePath: "/api/delete-image",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/delete-image",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/import",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/import",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest],
    modules: []
  }
];
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
__name2(lexer, "lexer");
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
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
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
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
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
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
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
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
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
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
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
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
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
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
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
          passThroughOnException: /* @__PURE__ */ __name2(() => {
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
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-VoimFY/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-VoimFY/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.6944513985006073.js.map
