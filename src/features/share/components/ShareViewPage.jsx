import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Terminal, Link as LinkIcon, Download, ArrowLeft,
    User, Clock, Loader2, AlertCircle, Copy, Check
} from 'lucide-react';
import { shareService } from '../shareService';
import { COMMAND_CATEGORIES } from '../../../utils/constants';

/**
 * ShareViewPage - 分享链接落地页
 * 
 * 用于展示通过 URL 分享的命令配置
 * 路由: /share/:id
 */
const ShareViewPage = ({ onImport }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [share, setShare] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(false);
    const [imported, setImported] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadShare = async () => {
            if (!id) {
                setError('无效的分享链接');
                setIsLoading(false);
                return;
            }

            try {
                const data = await shareService.getShareById(id);
                if (!data) {
                    setError('分享不存在或已被删除');
                } else {
                    setShare(data);
                }
            } catch (err) {
                console.error('Load share error:', err);
                setError('加载失败，请稍后重试');
            } finally {
                setIsLoading(false);
            }
        };

        loadShare();
    }, [id]);

    const handleImport = async () => {
        if (!share || !onImport) return;

        setImporting(true);
        try {
            await shareService.incrementDownloads(id);
            onImport({
                ...share.command,
                id: undefined,
                stageIds: [],
            });
            setImported(true);
        } catch (err) {
            console.error('Import error:', err);
        } finally {
            setImporting(false);
        }
    };

    const handleCopy = () => {
        const content = share?.command?.content || share?.command?.url || '';
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const category = share?.command?.category
        ? COMMAND_CATEGORIES.find(c => c.id === share.command.category)
        : null;

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 mb-2">{error}</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 md:py-12">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">返回</span>
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${share.command.type === 'link'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                {share.command.type === 'link' ? <LinkIcon size={24} /> : <Terminal size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl font-semibold text-gray-900 mb-1">
                                    {share.command.title}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    {category && (
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${category.color}`}>
                                            {category.label}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Download size={14} />
                                        {share.downloads || 0} 次导入
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Description */}
                        {share.description && (
                            <p className="text-gray-600 mb-6">{share.description}</p>
                        )}

                        {/* Command Content */}
                        <div className="relative">
                            <pre className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap break-all">
                                {share.command.content || share.command.url}
                            </pre>
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>

                        {/* Author Info */}
                        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {share.author.photoURL ? (
                                    <img
                                        src={share.author.photoURL}
                                        alt=""
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{share.author.displayName}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatDate(share.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Import Button */}
                            {onImport && (
                                <button
                                    onClick={handleImport}
                                    disabled={importing || imported}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${imported
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-gray-900 text-white hover:bg-black'
                                        } disabled:opacity-50`}
                                >
                                    {importing ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : imported ? (
                                        <Check size={16} />
                                    ) : (
                                        <Download size={16} />
                                    )}
                                    {imported ? '已导入' : '导入到我的命令'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ShareViewPage;
