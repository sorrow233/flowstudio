import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Terminal, Link as LinkIcon, Loader2, Check, Copy, ExternalLink } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { shareService } from '../shareService';

const SharePublishModal = ({ isOpen, onClose, command }) => {
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishedId, setPublishedId] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    const handlePublish = async () => {
        if (!user) {
            setError('请先登录后再分享');
            return;
        }

        if (!command) return;

        setIsPublishing(true);
        setError(null);

        try {
            const shareId = await shareService.publish(
                command,
                {
                    uid: user.uid,
                    displayName: user.displayName || user.email?.split('@')[0] || 'User',
                    photoURL: user.photoURL,
                },
                description
            );
            setPublishedId(shareId);
        } catch (err) {
            console.error('Publish error:', err);
            setError(err.message || '发布失败，请重试');
        } finally {
            setIsPublishing(false);
        }
    };

    const shareUrl = publishedId
        ? `${window.location.origin}/share/${publishedId}`
        : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setDescription('');
        setPublishedId(null);
        setError(null);
        onClose();
    };

    if (!command) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                                        <Share2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">分享到社区</h3>
                                        <p className="text-xs text-gray-500">让其他开发者发现你的配置</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-white/80 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {!publishedId ? (
                                <>
                                    {/* Command Preview */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${command.type === 'link' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {command.type === 'link' ? <LinkIcon size={16} /> : <Terminal size={16} />}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{command.title}</h4>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{command.category || 'general'}</span>
                                            </div>
                                        </div>
                                        <pre className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-100 overflow-x-auto font-mono">
                                            {command.content || command.url}
                                        </pre>
                                    </div>

                                    {/* Description Input */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            分享描述 <span className="text-gray-400 font-normal">(可选)</span>
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="描述一下这个命令的用途..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-300 outline-none resize-none text-sm"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleClose}
                                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={handlePublish}
                                            disabled={isPublishing || !user}
                                            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPublishing ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    发布中...
                                                </>
                                            ) : (
                                                <>
                                                    <Share2 size={18} />
                                                    发布分享
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* Success State */
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-4">
                                        <Check size={32} className="text-white" />
                                    </div>
                                    <h4 className="text-xl font-medium text-gray-900 mb-2">分享成功！</h4>
                                    <p className="text-gray-500 text-sm mb-6">你的命令配置已发布到社区</p>

                                    {/* Share Link */}
                                    <div className="p-4 bg-gray-50 rounded-xl mb-6">
                                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">分享链接</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={shareUrl}
                                                readOnly
                                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600"
                                            />
                                            <button
                                                onClick={handleCopy}
                                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-2"
                                            >
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                                {copied ? '已复制' : '复制'}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        完成
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SharePublishModal;
