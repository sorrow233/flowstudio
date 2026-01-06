import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const changeLanguage = (event) => {
        const newLang = event.target.value;
        i18n.changeLanguage(newLang);

        // Update URL
        const currentPath = location.pathname;
        const parts = currentPath.split('/').filter(Boolean);
        const supportedLangs = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'];

        let newPath = '';
        if (supportedLangs.includes(parts[0])) {
            // Replace existing lang
            if (newLang === 'en') {
                // Remove lang prefix for default if desired, or keep explicit?
                // Let's keep explicit for now if we are in explicit mode, OR remove if 'en' is default.
                // However, middleware handles both.
                // To be clean, maybe 'en' -> '/en/...'
                parts[0] = newLang;
                newPath = '/' + parts.join('/');
            } else {
                parts[0] = newLang;
                newPath = '/' + parts.join('/');
            }
        } else {
            // Prepend lang
            newPath = '/' + newLang + currentPath;
        }

        // Handle root special case (if switching to default lang, maybe go to / en?)
        // If sticking to explicit segments:
        navigate(newPath);
    };

    return (
        <div className="language-switcher">
            <select onChange={changeLanguage} value={i18n.language} className="language-select">
                <option value="en">English</option>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher;
