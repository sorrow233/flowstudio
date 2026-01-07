import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from '@/services/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

const ALLOWED_DOMAINS = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
    'yahoo.co.jp', 'yahoo.com', 'icloud.com', 'qq.com', '163.com',
    'googlemail.com', 'me.com', 'mac.com', 'naver.com', 'daum.net',
    'hanmail.net', 'docomo.ne.jp', 'softbank.ne.jp', 'ezweb.ne.jp'
];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        // Load guest status from local storage on mount
        const storedGuest = localStorage.getItem('isGuest');
        if (storedGuest === 'true') {
            setIsGuest(true);
        }

        if (!auth) {
            console.warn('Firebase configuration is missing. Defaulting to Guest Mode.');
            // Automatically enable guest mode if config is missing
            setIsGuest(true);
            setLoading(false);
            return;
        }

        // Handle Redirect Result
        getRedirectResult(auth)
            .then((result) => {
                // If we have a result, it means we just came back from a redirect login
                if (result?.user) {
                    console.log('Redirect login successful:', result.user.email);
                }
            })
            .catch((error) => {
                console.error('Redirect sign-in error:', error);
                setAuthError(error.message);
            });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('[AuthContext] Auth state changed:', user ? `User ${user.uid} logged in` : 'No user');
            setCurrentUser(user);
            if (user) {
                setIsGuest(false);
                localStorage.removeItem('isGuest');
            }
            setLoading(false);
        }, (error) => {
            console.error("[AuthContext] Auth State Check Error:", error);
            // If there's a real auth error (not just missing config), we might want to know,
            // but for now let's fall back to guest to keep things usable.
            setIsGuest(true);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    function checkAuth() {
        if (!auth) throw new Error("Authentication service is unavailable. Please check configuration.");
    }

    function loginAsGuest() {
        console.log('[AuthContext] Logging in as guest');
        setIsGuest(true);
        localStorage.setItem('isGuest', 'true');
        return Promise.resolve();
    }

    function signup(email, password) {
        console.log('[AuthContext] Signup attempt for:', email);
        checkAuth();
        const domain = email.split('@')[1];
        if (!ALLOWED_DOMAINS.includes(domain)) {
            console.warn('[AuthContext] Signup rejected - Unsupported domain:', domain);
            return Promise.reject(new Error('This email provider is not supported. Please use a common provider (Gmail, Outlook, Yahoo, etc.).'));
        }
        return createUserWithEmailAndPassword(auth, email, password)
            .then(res => {
                console.log('[AuthContext] Signup successful:', res.user.uid);
                return res;
            })
            .catch(err => {
                console.error('[AuthContext] Signup error:', err);
                throw err;
            });
    }

    function login(email, password) {
        console.log('[AuthContext] Login attempt for:', email);
        checkAuth();
        return signInWithEmailAndPassword(auth, email, password)
            .then(res => {
                console.log('[AuthContext] Login successful:', res.user.uid);
                return res;
            })
            .catch(err => {
                console.error('[AuthContext] Login error:', err);
                throw err;
            });
    }

    function loginWithGoogle() {
        console.log('[AuthContext] Initiating Google login redirect');
        checkAuth();
        const provider = new GoogleAuthProvider();
        // Use redirect instead of popup to avoid COOP issues
        return signInWithRedirect(auth, provider);
    }

    function logout() {
        console.log('[AuthContext] Logout called');
        if (isGuest) {
            console.log('[AuthContext] Clearing guest session');
            setIsGuest(false);
            localStorage.removeItem('isGuest');
            return Promise.resolve();
        }
        if (!auth) return Promise.resolve();
        return signOut(auth).then(() => console.log('[AuthContext] SignOut complete'));
    }

    const value = {
        currentUser,
        isGuest,
        signup,
        login,
        loginWithGoogle,
        loginAsGuest,
        logout,
        authError // Expose error so UI can show it
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
