import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useSettings } from '../../hooks/SettingsContext';
import PasswordAuthForm from './PasswordAuthForm';
import MagicLinkAuthForm from './MagicLinkAuthForm';
import { validateEmailDomain } from './authEmailDomains';
import { normalizeAuthError } from './authMessages';

const AuthModal = ({ isOpen, onClose }) => {
    const { login, register, loginWithGoogle, logout, user, sendEmailLoginLink } = useAuth();
    const { showAdvancedFeatures, toggleAdvancedFeatures } = useSettings();
    const [isLogin, setIsLogin] = useState(true);
    const [authMethod, setAuthMethod] = useState('magic-link');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!validateEmailDomain(email)) {
                    throw new Error('注册暂时只支持主流邮箱服务商，请使用常见邮箱地址。');
                }
                await register(email, password);
            }
            onClose();
        } catch (currentError) {
            setError(normalizeAuthError(currentError));
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLinkSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setLoading(true);

        try {
            const sentTo = await sendEmailLoginLink(email);
            setNotice(`已发送到 ${sentTo}，去邮箱打开登录链接即可。`);
        } catch (currentError) {
            setError(normalizeAuthError(currentError));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setNotice('');

        try {
            await loginWithGoogle();
            onClose();
        } catch (currentError) {
            setError(normalizeAuthError(currentError));
        }
    };

    const modalTitle = authMethod === 'magic-link'
        ? '邮箱免密登录'
        : (isLogin ? '登录云端同步' : '创建同步账户');

    const modalDescription = authMethod === 'magic-link'
        ? '打开邮箱点一下链接，就能直接登录 Flow Studio'
        : (isLogin ? '在多设备之间同步项目与数据' : '为 Flow Studio 开启独立同步空间');

    if (!isOpen) return null;

    if (user) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm text-center p-8"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>

                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl font-bold">{user.email?.[0]?.toUpperCase()}</span>
                    </div>

                    <h2 className="text-xl font-medium text-gray-900 mb-1">云端同步已启用</h2>
                    <p className="text-sm text-gray-500 mb-6">{user.email}</p>

                    <div className="w-full mb-6 text-left">
                        <div
                            onClick={toggleAdvancedFeatures}
                            className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all flex items-center gap-3 cursor-pointer group select-none border border-gray-100"
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showAdvancedFeatures ? 'bg-red-100' : 'bg-gray-200'}`}>
                                <Zap size={16} className={showAdvancedFeatures ? 'text-red-600' : 'text-gray-500'} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900">显示进阶模块</div>
                                <div className="text-xs text-gray-400 truncate">开启后导航栏显示进阶入口</div>
                            </div>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative ${showAdvancedFeatures ? 'bg-red-500' : 'bg-gray-300'}`}>
                                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${showAdvancedFeatures ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="w-full py-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl font-medium transition-colors"
                    >
                        退出登录
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-3 mt-3 text-gray-400 hover:text-gray-600 font-medium transition-colors"
                    >
                        关闭
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-light text-gray-900 leading-tight">
                                {modalTitle}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {modalDescription}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="mb-6 inline-flex rounded-2xl bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setAuthMethod('magic-link');
                                setIsLogin(true);
                                setError('');
                                setNotice('');
                            }}
                            className={`rounded-2xl px-4 py-2 text-sm transition-all ${
                                authMethod === 'magic-link'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            邮箱免密
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setAuthMethod('password');
                                setError('');
                                setNotice('');
                            }}
                            className={`rounded-2xl px-4 py-2 text-sm transition-all ${
                                authMethod === 'password'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            密码登录
                        </button>
                    </div>

                    {authMethod === 'magic-link' ? (
                        <MagicLinkAuthForm
                            email={email}
                            onEmailChange={setEmail}
                            onSubmit={handleMagicLinkSubmit}
                            loading={loading}
                            notice={notice}
                        />
                    ) : (
                        <PasswordAuthForm
                            isLogin={isLogin}
                            email={email}
                            password={password}
                            onEmailChange={setEmail}
                            onPasswordChange={setPassword}
                            onSubmit={handlePasswordSubmit}
                            loading={loading}
                            onToggleMode={() => {
                                setIsLogin((current) => !current);
                                setError('');
                                setNotice('');
                            }}
                        />
                    )}

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px bg-gray-100 flex-1" />
                        <span className="text-xs text-gray-400 font-mono">或</span>
                        <div className="h-px bg-gray-100 flex-1" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.66.81-.18z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        使用 Google 登录
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthModal;
