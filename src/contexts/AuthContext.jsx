import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
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
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        if (!auth) {
            setAuthError('Firebase configuration is missing or invalid.');
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        }, (error) => {
            console.error("Auth State Check Error:", error);
            setAuthError(error.message);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    function checkAuth() {
        if (!auth) throw new Error("Authentication service is unavailable. Please check configuration.");
    }

    function signup(email, password) {
        checkAuth();
        const domain = email.split('@')[1];
        if (!ALLOWED_DOMAINS.includes(domain)) {
            return Promise.reject(new Error('This email provider is not supported. Please use a common provider (Gmail, Outlook, Yahoo, etc.).'));
        }
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        checkAuth();
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithGoogle() {
        checkAuth();
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    function logout() {
        if (!auth) return Promise.resolve();
        return signOut(auth);
    }

    const value = {
        currentUser,
        signup,
        login,
        loginWithGoogle,
        logout,
        authError // Expose error so UI can show it
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
