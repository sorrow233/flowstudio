/**
 * Crypto Module - 信封加密工具库
 * 
 * 使用 Web Crypto API 实现 AES-GCM 加密和密钥管理。
 * 
 * 术语：
 * - DEK (Data Encryption Key): 直接加密数据的密钥，每个 Room 一把
 * - KEK (Key Encryption Key): 用于包装 DEK 的主密钥，每个用户一把
 */

// 固定盐值，用于密钥派生（不需要保密，但需要固定）
const SALT = new TextEncoder().encode('FlowStudio-Envelope-Encryption-v1');

// IV 长度（AES-GCM 推荐 12 字节）
const IV_LENGTH = 12;

/**
 * 从用户 UID 派生 KEK（Key Encryption Key）
 * 使用 HKDF 算法，确保同一 UID 在任何设备上都能派生出相同的密钥
 * 
 * @param {string} userId - Firebase 用户 UID
 * @returns {Promise<CryptoKey>} - 用于包装 DEK 的主密钥
 */
export async function deriveKekFromUserId(userId) {
    // 1. 将 userId 转换为密钥材料
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(userId),
        'HKDF',
        false,
        ['deriveKey']
    );

    // 2. 使用 HKDF 派生 AES-KW 密钥（用于密钥包装）
    const kek = await crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            salt: SALT,
            info: new TextEncoder().encode('KEK'),
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-KW', length: 256 },
        false,  // 不可导出
        ['wrapKey', 'unwrapKey']
    );

    return kek;
}

/**
 * 生成随机 DEK（Data Encryption Key）
 * 
 * @returns {Promise<CryptoKey>} - 用于加密数据的密钥
 */
export async function generateDek() {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,  // 可导出（需要导出后包装存储）
        ['encrypt', 'decrypt']
    );
}

/**
 * 用 KEK 包装 DEK（密钥包装）
 * 
 * @param {CryptoKey} dek - 数据加密密钥
 * @param {CryptoKey} kek - 密钥加密密钥
 * @returns {Promise<string>} - Base64 编码的包装后密钥
 */
export async function wrapKey(dek, kek) {
    const wrapped = await crypto.subtle.wrapKey(
        'raw',
        dek,
        kek,
        'AES-KW'
    );
    return arrayBufferToBase64(wrapped);
}

/**
 * 用 KEK 解包 DEK
 * 
 * @param {string} wrappedKeyBase64 - Base64 编码的包装后密钥
 * @param {CryptoKey} kek - 密钥加密密钥
 * @returns {Promise<CryptoKey>} - 解包后的数据加密密钥
 */
export async function unwrapKey(wrappedKeyBase64, kek) {
    const wrappedKey = base64ToArrayBuffer(wrappedKeyBase64);
    return await crypto.subtle.unwrapKey(
        'raw',
        wrappedKey,
        kek,
        'AES-KW',
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * 使用 DEK 加密数据
 * 
 * @param {Uint8Array} data - 要加密的原始数据
 * @param {CryptoKey} dek - 数据加密密钥
 * @returns {Promise<string>} - Base64 编码的密文（包含 IV）
 */
export async function encrypt(data, dek) {
    // 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // 加密
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        dek,
        data
    );

    // 将 IV 和密文拼接在一起
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return arrayBufferToBase64(combined.buffer);
}

/**
 * 使用 DEK 解密数据
 * 
 * @param {string} ciphertextBase64 - Base64 编码的密文（包含 IV）
 * @param {CryptoKey} dek - 数据加密密钥
 * @returns {Promise<Uint8Array>} - 解密后的原始数据
 */
export async function decrypt(ciphertextBase64, dek) {
    const combined = new Uint8Array(base64ToArrayBuffer(ciphertextBase64));

    // 分离 IV 和密文
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);

    // 解密
    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        dek,
        ciphertext
    );

    return new Uint8Array(plaintext);
}

// ============ 工具函数 ============

/**
 * ArrayBuffer 转 Base64
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Base64 转 ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
