import { useEffect, useState } from 'react';
import {
    detectIsIOS,
    detectIsIOSSafari,
    detectIsStandalone,
} from '../../hooks/useIOSStandalone';

const STORAGE_KEY = 'flowstudio_ios_home_screen_prompt_until';
const PERMANENT_DISMISS_VALUE = 'never';

const getDismissState = () => {
    if (typeof window === 'undefined') {
        return {
            dismissedUntil: 0,
            permanentlyDismissed: false,
        };
    }

    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (rawValue === PERMANENT_DISMISS_VALUE) {
        return {
            dismissedUntil: Number.POSITIVE_INFINITY,
            permanentlyDismissed: true,
        };
    }

    const parsedValue = Number(rawValue);

    return {
        dismissedUntil: Number.isFinite(parsedValue) ? parsedValue : 0,
        permanentlyDismissed: false,
    };
};

const setDismissValue = (value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, String(value));
};

export function useIOSHomeScreenPrompt() {
    const [state, setState] = useState({
        isReady: false,
        isIOS: false,
        isStandalone: false,
        isSafari: false,
        canShare: false,
        shouldShow: false,
        isGuideOpen: false,
    });

    useEffect(() => {
        const isIOS = detectIsIOS();
        const isStandalone = detectIsStandalone();
        const isSafari = detectIsIOSSafari();
        const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
        const { dismissedUntil, permanentlyDismissed } = getDismissState();
        const shouldShow = isIOS && !isStandalone && !permanentlyDismissed && Date.now() >= dismissedUntil;

        setState({
            isReady: true,
            isIOS,
            isStandalone,
            isSafari,
            canShare,
            shouldShow,
            isGuideOpen: false,
        });
    }, []);

    const openGuide = () => {
        setState((current) => ({ ...current, isGuideOpen: true }));
    };

    const closeGuide = () => {
        setState((current) => ({ ...current, isGuideOpen: false }));
    };

    const dismissPrompt = () => {
        setDismissValue(PERMANENT_DISMISS_VALUE);
        setState((current) => ({
            ...current,
            shouldShow: false,
            isGuideOpen: false,
        }));
    };

    const openShareSheet = async () => {
        if (!state.isSafari || !state.canShare || typeof window === 'undefined') {
            openGuide();
            return { opened: false, fallbackToGuide: true };
        }

        try {
            await navigator.share({
                title: document.title || 'Flow Studio',
                text: '把 Flow Studio 添加到主屏幕，像 App 一样随手打开。',
                url: window.location.href,
            });

            return { opened: true, fallbackToGuide: false };
        } catch (error) {
            if (error?.name === 'AbortError') {
                return { opened: false, cancelled: true, fallbackToGuide: false };
            }

            openGuide();
            return { opened: false, fallbackToGuide: true, error };
        }
    };

    return {
        ...state,
        openGuide,
        closeGuide,
        openShareSheet,
        dismissPrompt,
    };
}

export default useIOSHomeScreenPrompt;
