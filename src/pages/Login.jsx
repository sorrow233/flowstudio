import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Eye, EyeOff, Loader2, Globe } from 'lucide-react';
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

    // Redirect if already logged in OR is guest
    useEffect(() => {
        if (currentUser || isGuest) {
            navigate(from, { replace: true });
        }
    }, [currentUser, isGuest, navigate, from]);

    // Helper to handle guest login
    const handleGuestLogin = async () => {
        await loginAsGuest();
        navigate(from, { replace: true });
    };

    // Auto-redirect if guest (implicit or explicit)
    // We remove the blocking "Configuration Error" UI entirely
    if (authError && !loading) {
        // Optionally we could show a toast here, but user asked for seamless experience
        // If there is an auth error (missing config), we just assume guest mode
        // But we shouldn't automatically redirect if they are explicitly ON the login page
        // trying to maybe fix it? 
        // Actually, if they are on /login, and config is missing, they can't login anyway.
        // So showing the form is useless.
        // Let's show the form but disabled? Or just redirect?
        // User said: "Should directly enter software... Log in when needed."
        // So if they come to /login, they probably want to login.
        // But if config is missing, they CAN'T. 
        // So maybe we just redirect to /app as guest automatically?
        // Let's do that.
        loginAsGuest().then(() => navigate('/app', { replace: true }));
        return null; // Render nothing while redirecting
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
            // Simplify error messages for user
            if (err.message.includes('auth/invalid-email')) {
                setError(t('auth.error_invalid_email', 'Invalid email address'));
            } else if (err.message.includes('auth/user-not-found') || err.message.includes('auth/wrong-password') || err.message.includes('auth/invalid-credential')) {
                setError(t('auth.error_invalid_credentials', 'Invalid email or password'));
            } else if (err.message.includes('auth/email-already-in-use')) {
                setError(t('auth.error_email_in_use', 'Email is already in use'));
            } else if (err.message.includes('email provider is not supported')) {
                setError(err.message); // Use the custom error message from context
            } else {
                setError(t('auth.error_generic', 'Failed to authenticate. Please try again.'));
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
            setLoading(false); // Only set loading false on error, success navigates away
        }
    }

    return (
        <div className="login-container">
            <div className="login-language-switcher">
                <LanguageSwitcher />
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h1>Flow Studio</h1>
                    <p className="login-subtitle">
                        {isLogin ? t('auth.welcome_back', 'Welcome Back') : t('auth.create_account', 'Create Account')}
                    </p>
                </div>

                {error && <div className="login-error" role="alert">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">{t('auth.email', 'Email')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{t('auth.password', 'Password')}</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder={isLogin ? "••••••••" : t('auth.password_min', 'At least 6 characters')}
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? t('auth.login', 'Log In') : t('auth.signup', 'Sign Up'))}
                    </button>
                </form>

                <div style={{ marginTop: '1rem' }}>
                    <button
                        type="button"
                        className="btn-google"
                        style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', textDecoration: 'underline' }}
                        onClick={handleGuestLogin}
                    >
                        {t('auth.continue_guest', 'Continue as Guest')}
                    </button>
                </div>

                <div className="divider">
                    <span>{t('auth.or', 'or')}</span>
                </div>

                <button
                    type="button"
                    className="btn-google"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.284 47.269 -26.754 49.129 -26.754 51.129 C -26.754 53.129 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.769 C -12.984 43.769 -11.404 44.369 -10.154 45.579 L -6.724 42.149 C -8.804 40.209 -11.514 39.019 -14.754 39.019 C -19.444 39.019 -23.494 41.719 -25.464 45.639 L -21.484 48.729 C -20.534 45.879 -17.884 43.769 -14.754 43.769 Z" />
                        </g>
                    </svg>
                    {t('auth.continue_google', 'Continue with Google')}
                </button>

                <div className="login-footer">
                    <p>
                        {isLogin ? t('auth.no_account', "Don't have an account?") : t('auth.has_account', 'Already have an account?')}
                        {' '}
                        <button
                            type="button"
                            className="link-btn"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? t('auth.signup', 'Sign Up') : t('auth.login', 'Log In')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
