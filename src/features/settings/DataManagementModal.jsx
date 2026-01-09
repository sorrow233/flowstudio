import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, FileJson, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useSyncStore } from '../sync/useSyncStore';
import { exportAllData, importData, validateImportData, downloadAsJson, readJsonFile } from './dataUtils';

const DataManagementModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('menu'); // 'menu' | 'importing' | 'preview'
    const [importFile, setImportFile] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const { doc } = useSyncStore('flowstudio_v1');

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
        const { pendingProjects, primaryProjects, commands, customCategories } = previewData.data;
        return {
            pending: pendingProjects?.length || 0,
            primary: primaryProjects?.length || 0,
            commands: commands?.length || 0,
            categories: customCategories?.length || 0,
        };
    }, [previewData]);

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
                className="relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md"
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-medium text-gray-900">
                                {mode === 'menu' && '数据管理'}
                                {mode === 'preview' && '导入预览'}
                            </h2>
                            <p className="text-sm text-gray-400 mt-0.5">
                                {mode === 'menu' && '备份或恢复您的工作区数据'}
                                {mode === 'preview' && '确认导入以下数据'}
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
