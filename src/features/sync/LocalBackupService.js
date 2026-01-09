/**
 * 本地定时备份服务
 * 
 * 功能：
 * 1. 每小时自动备份完整数据到 localStorage
 * 2. 保留最多3天（72个小时备份点）的历史数据
 * 3. 仅在在线状态时执行备份
 * 4. 页面卸载时保存最后一次备份
 */

import { useEffect, useRef, useCallback } from 'react';
import { exportAllData } from '../settings/dataUtils';

// 备份间隔：1小时
const BACKUP_INTERVAL_MS = 60 * 60 * 1000;

// 保留天数：3天 = 72小时
const MAX_BACKUP_AGE_MS = 3 * 24 * 60 * 60 * 1000;

// localStorage key
const BACKUP_STORAGE_KEY = 'flowstudio_local_backups';

/**
 * 获取所有本地备份
 * @returns {Array} 备份数组
 */
export const getLocalBackups = () => {
    try {
        const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed.backups) ? parsed.backups : [];
    } catch (e) {
        console.warn('[LocalBackup] Failed to parse backups:', e);
        return [];
    }
};

/**
 * 获取最新的本地备份
 * @returns {Object|null} 最新备份或null
 */
export const getLatestBackup = () => {
    const backups = getLocalBackups();
    if (backups.length === 0) return null;
    return backups.reduce((latest, current) =>
        current.timestamp > latest.timestamp ? current : latest
    );
};

/**
 * 保存备份到 localStorage
 * @param {Array} backups - 备份数组
 * @param {number} lastBackupTime - 最后备份时间戳
 */
const saveBackups = (backups, lastBackupTime) => {
    try {
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify({
            backups,
            lastBackupTime
        }));
    } catch (e) {
        console.error('[LocalBackup] Failed to save backups:', e);
        // 如果存储满了，尝试清理一些旧备份再保存
        if (e.name === 'QuotaExceededError') {
            const trimmedBackups = backups.slice(0, Math.floor(backups.length / 2));
            try {
                localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify({
                    backups: trimmedBackups,
                    lastBackupTime
                }));
                console.warn('[LocalBackup] Storage full, trimmed old backups.');
            } catch (e2) {
                console.error('[LocalBackup] Still failed after trimming:', e2);
            }
        }
    }
};

/**
 * 清理超过3天的旧备份
 * @param {Array} backups - 备份数组
 * @returns {Array} 清理后的备份数组
 */
const cleanupOldBackups = (backups) => {
    const cutoffTime = Date.now() - MAX_BACKUP_AGE_MS;
    const cleaned = backups.filter(b => b.timestamp > cutoffTime);

    if (cleaned.length < backups.length) {
        console.info(`[LocalBackup] Cleaned ${backups.length - cleaned.length} old backups.`);
    }

    return cleaned;
};

/**
 * 执行备份
 * @param {Y.Doc} doc - Y.Doc 实例
 * @returns {boolean} 是否成功
 */
export const performBackup = (doc) => {
    if (!doc) {
        console.warn('[LocalBackup] No Y.Doc provided, skipping backup.');
        return false;
    }

    try {
        const now = Date.now();
        const data = exportAllData(doc);

        // 获取现有备份
        let backups = getLocalBackups();

        // 清理旧备份
        backups = cleanupOldBackups(backups);

        // 添加新备份
        backups.push({
            timestamp: now,
            data
        });

        // 保存
        saveBackups(backups, now);

        console.info(`[LocalBackup] Backup completed at ${new Date(now).toLocaleString()}, total ${backups.length} backups.`);
        return true;
    } catch (e) {
        console.error('[LocalBackup] Backup failed:', e);
        return false;
    }
};

/**
 * React Hook: 启用本地定时备份
 * @param {Y.Doc} doc - Y.Doc 实例
 */
export const useLocalBackup = (doc) => {
    const intervalRef = useRef(null);
    const docRef = useRef(doc);

    // 保持 doc 引用更新
    useEffect(() => {
        docRef.current = doc;
    }, [doc]);

    // 检查是否应该执行备份
    const shouldBackup = useCallback(() => {
        // 检查在线状态
        if (!navigator.onLine) {
            console.info('[LocalBackup] Offline, skipping scheduled backup.');
            return false;
        }

        // 检查距离上次备份的时间
        try {
            const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
            if (stored) {
                const { lastBackupTime } = JSON.parse(stored);
                const elapsed = Date.now() - lastBackupTime;
                // 如果距离上次备份不足50分钟，跳过（允许一些误差）
                if (elapsed < BACKUP_INTERVAL_MS - 10 * 60 * 1000) {
                    return false;
                }
            }
        } catch (e) {
            // 解析失败，继续备份
        }

        return true;
    }, []);

    // 定时备份
    useEffect(() => {
        if (!doc) return;

        // 初始化时检查是否需要立即备份
        const initialCheck = () => {
            try {
                const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
                if (!stored) {
                    // 首次备份延迟1分钟执行，避免页面加载时数据未完全同步
                    setTimeout(() => {
                        if (docRef.current && navigator.onLine) {
                            performBackup(docRef.current);
                        }
                    }, 60 * 1000);
                } else {
                    const { lastBackupTime } = JSON.parse(stored);
                    const elapsed = Date.now() - lastBackupTime;
                    // 如果超过1小时没备份，立即备份
                    if (elapsed >= BACKUP_INTERVAL_MS) {
                        performBackup(doc);
                    }
                }
            } catch (e) {
                // 首次备份
                setTimeout(() => {
                    if (docRef.current && navigator.onLine) {
                        performBackup(docRef.current);
                    }
                }, 60 * 1000);
            }
        };

        initialCheck();

        // 设置定时器
        intervalRef.current = setInterval(() => {
            if (shouldBackup() && docRef.current) {
                performBackup(docRef.current);
            }
        }, BACKUP_INTERVAL_MS);

        // 在线状态恢复时检查备份
        const handleOnline = () => {
            console.info('[LocalBackup] Online status restored, checking backup...');
            if (shouldBackup() && docRef.current) {
                performBackup(docRef.current);
            }
        };

        // 页面卸载前保存最后一次备份
        const handleBeforeUnload = () => {
            if (docRef.current && navigator.onLine) {
                performBackup(docRef.current);
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [doc, shouldBackup]);
};
