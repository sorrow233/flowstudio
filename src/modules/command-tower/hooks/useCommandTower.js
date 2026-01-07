import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Logger } from '@/utils/logger';

// --- Constants ---
export const freshColors = [
    { color: '#3ECFB2', name: '薄荷绿' },   // Mint Green
    { color: '#FFB5C5', name: '樱花粉' },   // Sakura Pink
    { color: '#87CEEB', name: '天空蓝' },   // Sky Blue
    { color: '#FFEAA7', name: '柠檬黄' },   // Lemon Yellow
    { color: '#C3AED6', name: '薰衣草紫' }, // Lavender Purple
    { color: '#FFCCBC', name: '蜜桃橙' },   // Peach Orange
    { color: '#B2DFDB', name: '青瓷绿' },   // Celadon Green
    { color: '#F8BBD9', name: '玫瑰粉' },   // Rose Pink
];

const defaultStages = [
    { key: 'inspiration', icon: 'Lightbulb', label: 'modules.backlog.sections.inspiration', color: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', defaultCmdColor: '#d4fc79' },
    { key: 'pending', icon: 'Rocket', label: 'modules.backlog.sections.pending', color: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', defaultCmdColor: '#f093fb' },
    { key: 'early', icon: 'Sprout', label: 'modules.workshop.stages.early', color: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', defaultCmdColor: '#84fab0' },
    { key: 'growth', icon: 'TrendingUp', label: 'modules.workshop.stages.growth', color: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', defaultCmdColor: '#fccb90' },
    { key: 'advanced', icon: 'Award', label: 'modules.workshop.stages.advanced', color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', defaultCmdColor: '#e0c3fc' },
    { key: 'commercial', icon: 'DollarSign', label: 'modules.workshop.stages.commercial', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', defaultCmdColor: '#a8edea' }
];

function getDefaultCommands() {
    return {
        inspiration: [
            { id: 1, title: 'Code Review Prompt', content: 'Review this code for best practices...' }
        ],
        pending: [
            { id: 2, title: 'Deploy Pipeline', content: 'npm run deploy:main' }
        ],
        early: [
            { id: 3, title: 'Git Status', content: 'git status' }
        ],
        growth: [
            { id: 4, title: 'Full Scan', content: '/filescan' }
        ],
        advanced: [],
        commercial: []
    };
}

export function useCommandTower() {
    const { t } = useTranslation();

    // --- State ---
    const [stages, setStages] = useState(() => {
        const saved = localStorage.getItem('commandTowerStages');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0 && !parsed[0].color.includes('gradient')) {
                return defaultStages.map(ds => {
                    const existing = parsed.find(p => p.key === ds.key);
                    return existing ? { ...existing, color: ds.color } : ds;
                }).concat(parsed.filter(p => !defaultStages.find(ds => ds.key === p.key)));
            }
            return parsed;
        }
        return defaultStages;
    });

    const [commands, setCommands] = useState(() => {
        const saved = localStorage.getItem('commandTowerData');
        return saved ? JSON.parse(saved) : getDefaultCommands();
    });

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('commandTowerData', JSON.stringify(commands));
    }, [commands]);

    useEffect(() => {
        localStorage.setItem('commandTowerStages', JSON.stringify(stages));
    }, [stages]);

    // --- Helpers ---
    const getStageDefaultColor = (stageKey) => {
        const stage = stages.find(s => s.key === stageKey);
        if (stage?.defaultCmdColor) return stage.defaultCmdColor;
        return freshColors[0].color;
    };

    // --- Actions ---
    const addCommand = (commandData) => {
        // commandData: { title, content, stage, color }
        const { title, content, stage, color } = commandData;
        if (!title?.trim() || !content?.trim() || !stage) return;

        Logger.info('CommandTower', 'Adding new command:', commandData);
        const newId = Date.now();
        const commandColor = color || getStageDefaultColor(stage);

        setCommands(prev => ({
            ...prev,
            [stage]: [...(prev[stage] || []), {
                id: newId,
                title: title,
                content: content,
                color: commandColor
            }]
        }));
    };

    const deleteCommand = (stageKey, id) => {
        if (confirm(t('common.delete_confirm') || "Are you sure?")) {
            Logger.info('CommandTower', 'Deleting command:', stageKey, id);
            setCommands(prev => ({
                ...prev,
                [stageKey]: prev[stageKey].filter(cmd => cmd.id !== id)
            }));
        }
    };

    const updateCommand = (stageKey, command) => {
        // command: { id, title, content, color, ... }
        if (!command || !command.title?.trim()) return;
        setCommands(prev => ({
            ...prev,
            [stageKey]: prev[stageKey].map(cmd =>
                cmd.id === command.id ? command : cmd
            )
        }));
    };

    const addStage = (stageData) => {
        // stageData: { label, color }
        if (!stageData.label?.trim()) return;
        const key = `custom_${Date.now()}`;
        const newStageObj = {
            key,
            label: stageData.label,
            icon: 'Layers',
            color: stageData.color,
            isCustom: true
        };

        setStages(prev => [...prev, newStageObj]);
        setCommands(prev => ({ ...prev, [key]: [] }));
        Logger.info('CommandTower', 'Added new stage:', newStageObj);
    };

    const deleteStage = (stageKey) => {
        if (confirm(t('common.delete_stage_confirm') || "Delete this category and all its commands?")) {
            Logger.info('CommandTower', 'Deleting stage:', stageKey);
            setStages(prev => prev.filter(s => s.key !== stageKey));
            setCommands(prev => {
                const newCmds = { ...prev };
                delete newCmds[stageKey];
                return newCmds;
            });
        }
    };

    const renameStage = (stageKey, newLabel) => {
        if (!newLabel?.trim()) return;
        setStages(prev => prev.map(s =>
            s.key === stageKey
                ? { ...s, customLabel: newLabel }
                : s
        ));
    };

    return {
        stages,
        commands,
        defaultStages,
        actions: {
            addCommand,
            deleteCommand,
            updateCommand,
            addStage,
            deleteStage,
            renameStage,
            getStageDefaultColor
        }
    };
}
