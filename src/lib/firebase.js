import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyA20FrNmdIPE2Sb9r97s7cj2w6MLYgcB_M",
    // 使用自定义域名避免第三方 cookie 被浏览器拦截
    authDomain: "flowstudio.catzz.work",
    projectId: "flow-7ffad",
    storageBucket: "flow-7ffad.firebasestorage.app",
    messagingSenderId: "790402502704",
    appId: "1:790402502704:web:0be1cf358b26796ac75df5",
    measurementId: "G-PPC7ZZ6WMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth with explicit localStorage persistence
// 避免依赖 indexedDB（在 iOS PWA / 隐私模式下可能不稳定）
export const auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
});
export const db = getFirestore(app);

export default app;
