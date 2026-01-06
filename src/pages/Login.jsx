import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Eye, EyeOff, Loader2, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

export default function Login() {
    const { t } = useTranslation();
    const { login, signup, loginWithGoogle, loginAsGuest, authError, currentUser, isGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/app';

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser || isGuest) {
            navigate(from, { replace: true });
        }
    }, [currentUser, isGuest, navigate, from]);

    const handleGuestLogin = async () => {
        await loginAsGuest();
        navigate(from, { replace: true });
    };

    if (authError && !loading) {
        loginAsGuest().then(() => navigate('/app', { replace: true }));
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
            if (err.message.includes('auth/invalid-email')) {
                setError(t('auth.error_invalid_email', 'Invalid email address'));
            } else if (err.message.includes('auth/user-not-found') || err.message.includes('auth/wrong-password') || err.message.includes('auth/invalid-credential')) {
                setError(t('auth.error_invalid_credentials', 'Invalid email or password'));
            } else {
                setError(t('auth.error_generic', 'Failed to authenticate.'));
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        if (loading) return;
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
            setError(t('auth.error_google', 'Failed to sign in with Google.'));
            setLoading(false);
        }
    }

    return (
        <div className="login-visual-container">
            <div className="login-ambient-bg">
                <div className="glow-sphere indigo" />
                <div className="glow-sphere vermilion" />
            </div>

            <Link to="/" className="login-back-btn">
                <ChevronLeft size={20} />
                <span>{t('auth.back_home', 'Back')}</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="login-card-zen"
            >
                <div className="login-header-zen">
                    <div className="login-brand">
                        <Sparkles size={24} className="brand-icon" />
                        <h1>Flow Studio</h1>
                    </div>
                    <p className="login-subtitle-zen">
                        {isLogin ? t('auth.welcome_back', 'Welcome back to your workshop') : t('auth.create_account', 'Begin your digital journey')}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="login-error-zen"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="login-form-zen">
                    <div className="form-group-zen">
                        <label>{t('auth.email', 'Email Address')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="form-group-zen">
                        <label>{t('auth.password', 'Password')}</label>
                        <div className="password-wrapper-zen">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-zen"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-auth-primary" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? t('auth.login', 'Sign In') : t('auth.signup', 'Create Account'))}
                    </button>
                </form>

                <div className="login-divider-zen">
                    <span>{t('auth.or', 'or continue with')}</span>
                </div>

                <div className="login-social-grid">
                    <button onClick={handleGoogleLogin} className="btn-social-zen" disabled={loading}>
                        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        <span>Google</span>
                    </button>
                    <button onClick={handleGuestLogin} className="btn-social-zen" disabled={loading}>
                        <span>{t('auth.guest', 'Guest')}</span>
                    </button>
                </div>

                <div className="login-footer-zen">
                    <p>
                        {isLogin ? t('auth.no_account', "New here?") : t('auth.has_account', 'Already have an account?')}
                        <button onClick={() => setIsLogin(!isLogin)} className="link-toggle-zen">
                            {isLogin ? t('auth.signup', 'Start journey') : t('auth.login', 'Sign in')}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
