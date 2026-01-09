import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, FileJson, AlertCircle, CheckCircle2, Loader2, Zap, Settings as SettingsIcon, Database, History, RotateCcw, Clock } from 'lucide-react';
import { useSync } from '../sync/SyncContext';
import { useSettings } from '../../hooks/SettingsContext';
import { exportAllData, importData, validateImportData, downloadAsJson, readJsonFile } from './dataUtils';
import { getLocalBackups } from '../sync/LocalBackupService';

const DataManagementModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('menu'); // 'menu' | 'importing' | 'preview' | 'settings' | 'backups'
    const [importFile, setImportFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [backups, setBackups] = useState([]);

    const fileInputRef = useRef(null);

    const { doc } = useSync();
    const { showAdvancedFeatures, toggleAdvancedFeatures } = useSettings();

    // 加载备份列表
    useEffect(() => {
        if (mode === 'backups') {
            const list = getLocalBackups().sort((a, b) => b.timestamp - a.timestamp);
            setBackups(list);
        }
    }, [mode]);

    const resetState = () => {
        setMode('menu');
        setImportFile(null);
        setPreviewData(null);
        setError('');
        setSuccess('');
        setLoading(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    // 导出处理
    const handleExport = () => {
        try {
            setLoading(true);
            const data = exportAllData(doc);
            const timestamp = new Date().toISOString().split('T')[0];
            downloadAsJson(data, `flowstudio-backup-${timestamp}.json`);
            setSuccess('数据已成功导出！');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`导出失败: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 加载备份进行预览（恢复流程）
    const handleRestoreBackup = (backup) => {
        try {
            const validation = validateImportData(backup.data);
            if (!validation.valid) {
                setError('备份数据验证失败: ' + validation.errors.join('\n'));
                return;
            }

            setImportFile({ name: `自动备份 (${new Date(backup.timestamp).toLocaleString()})` });
            setPreviewData(backup.data);
            setImportMode('replace'); // 恢复备份默认使用覆盖模式
            setMode('preview');
        } catch (e) {
            setError('加载备份失败: ' + e.message);
        }
    };

    // 下载单个备份
    const handleDownloadBackup = (backup) => {
        const dateStr = new Date(backup.timestamp).toISOString().replace(/[:.]/g, '-');
        downloadAsJson(backup.data, `flowstudio-auto-backup-${dateStr}.json`);
    };

    // 文件选择处理
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setLoading(true);

        try {
            const data = await readJsonFile(file);
            const validation = validateImportData(data);

            if (!validation.valid) {
                setError(validation.errors.join('\n'));
                setLoading(false);
                return;
            }

            setImportFile(file);
            setPreviewData(data);
            setMode('preview');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 拖拽处理
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/json') {
            // 模拟 fileInput 的 change 事件
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            if (fileInputRef.current) {
                fileInputRef.current.files = dataTransfer.files;
                handleFileSelect({ target: { files: dataTransfer.files } });
            }
        } else {
            setError('请上传 JSON 文件');
        }
    };

    // 执行导入
    const executeImport = () => {
        if (!previewData) return;

        setLoading(true);
        try {
            importData(doc, previewData, importMode);
            setSuccess('数据导入成功！页面将刷新以应用更改。');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            setError(`导入失败: ${err.message}`);
            setLoading(false);
        }
    };

    // 统计摘要
    const getDataSummary = useCallback(() => {
        if (!previewData?.data) return null;
        const {
            allProjects, allCommands, commandCategories,
            pendingProjects, primaryProjects, commands, customCategories
        } = previewData.data;

        // Calculate counts from unified storage
        let newPending = 0;
        let newPrimary = 0;

        if (Array.isArray(allProjects)) {
            newPending = allProjects.filter(p => p.stage === 'pending').length;
            newPrimary = allProjects.filter(p => !['pending', 'inspiration'].includes(p.stage)).length;
        }

        return {
            pending: (pendingProjects?.length || 0) + newPending,
            primary: (primaryProjects?.length || 0) + newPrimary,
            commands: (commands?.length || 0) + (allCommands?.length || 0),
            categories: (customCategories?.length || 0) + (commandCategories?.length || 0),
        };
    }, [previewData]);

    // 渲染备份项摘要
    const getBackupSummary = (backupData) => {
        const { allProjects, allCommands } = backupData?.data || {};
        const count = (allProjects?.length || 0) + (allCommands?.length || 0);
        return `${count} items`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
            >
                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                                {mode !== 'menu' && (
                                    <button
                                        onClick={() => setMode('menu')}
                                        className="hover:bg-gray-100 p-1 rounded-lg -ml-2 mr-1 transition-colors"
                                    >
                                        <X size={16} className="rotate-45" /> {/* Use X as back sort of, or better Back icon */}
                                    </button>
                                )}
                                {mode === 'menu' && '设置'}
                                {mode === 'preview' && '导入预览'}
                                {mode === 'backups' && '本地备份历史'}
                            </h2>
                            <p className="text-sm text-gray-400 mt-0.5">
                                {mode === 'menu' && '管理应用偏好与数据'}
                                {mode === 'preview' && '确认导入以下数据'}
                                {mode === 'backups' && '每小时自动备份，最多保留3天'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span className="whitespace-pre-wrap">{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100 flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            {success}
                        </div>
                    )}

                    {/* Main Menu */}
                    {mode === 'menu' && (
                        <div className="space-y-3">
                            {/* Local Backups Button */}
                            <button
                                onClick={() => setMode('backups')}
                                className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <History size={22} className="text-purple-600" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-medium text-gray-900">本地备份</div>
                                    <div className="text-sm text-gray-400">查看和恢复自动备份</div>
                                </div>
                            </button>

                            {/* Export Button */}
                            <button
                                onClick={handleExport}
                                disabled={loading}
                                className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Download size={22} className="text-emerald-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">导出数据</div>
                                    <div className="text-sm text-gray-400">下载所有项目和配置</div>
                                </div>
                            </button>

                            {/* Import Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-6 border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-2xl transition-all cursor-pointer flex flex-col items-center gap-3 group"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Upload size={22} className="text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <div className="font-medium text-gray-900">导入数据</div>
                                    <div className="text-sm text-gray-400">拖拽或点击选择 JSON 文件</div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}

                    {/* Backups List */}
                    {mode === 'backups' && (
                        <div className="space-y-3">
                            {backups.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <History size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>暂无本地备份</p>
                                    <p className="text-xs mt-1">系统会在您在线时每小时自动备份</p>
                                </div>
                            ) : (
                                backups.map((backup, index) => (
                                    <div key={backup.timestamp} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between group hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-500">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {new Date(backup.timestamp).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {getBackupSummary(backup)} · {Math.round(JSON.stringify(backup.data).length / 1024)} KB
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleRestoreBackup(backup)}
                                                className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                                                title="恢复此备份"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadBackup(backup)}
                                                className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors"
                                                title="下载 JSON"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}

                            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                                <button
                                    onClick={() => setMode('menu')}
                                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    返回主菜单
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Import Preview */}
                    {mode === 'preview' && previewData && (
                        <div className="space-y-4">
                            {/* File Info */}
                            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                                <FileJson size={24} className="text-blue-500" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">{importFile?.name}</div>
                                    <div className="text-xs text-gray-400">
                                        导出于 {new Date(previewData.exportedAt).toLocaleString('zh-CN')}
                                    </div>
                                </div>
                            </div>

                            {/* Data Summary */}
                            {(() => {
                                const summary = getDataSummary();
                                if (!summary) return null;
                                return (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-amber-50 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-amber-600">{summary.pending}</div>
                                            <div className="text-xs text-amber-500">待定项目</div>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-emerald-600">{summary.primary}</div>
                                            <div className="text-xs text-emerald-500">主开发项目</div>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-blue-600">{summary.commands}</div>
                                            <div className="text-xs text-blue-500">命令</div>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-purple-600">{summary.categories}</div>
                                            <div className="text-xs text-purple-500">自定义分类</div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Import Mode Selection */}
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700">导入模式</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setImportMode('merge')}
                                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${importMode === 'merge'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        合并（保留现有）
                                    </button>
                                    <button
                                        onClick={() => setImportMode('replace')}
                                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${importMode === 'replace'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        覆盖（替换全部）
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={resetState}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={executeImport}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            导入中...
                                        </>
                                    ) : (
                                        '确认导入'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default DataManagementModal;
