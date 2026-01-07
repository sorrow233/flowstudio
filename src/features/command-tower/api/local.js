import { nanoid } from 'nanoid';
import { Logger } from '@/utils/logger';

const STORAGE_KEYS = {
    STAGES: 'commandTowerStages',
    COMMANDS: 'commandTowerData'
};

const DEFAULT_STAGES = [
    { key: 'inspiration', icon: 'Lightbulb', label: 'modules.backlog.sections.inspiration', color: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', defaultCmdColor: '#d4fc79' },
    { key: 'pending', icon: 'Rocket', label: 'modules.backlog.sections.pending', color: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', defaultCmdColor: '#f093fb' },
    { key: 'early', icon: 'Sprout', label: 'modules.workshop.stages.early', color: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', defaultCmdColor: '#84fab0' },
    { key: 'growth', icon: 'TrendingUp', label: 'modules.workshop.stages.growth', color: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', defaultCmdColor: '#fccb90' },
    { key: 'advanced', icon: 'Award', label: 'modules.workshop.stages.advanced', color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', defaultCmdColor: '#e0c3fc' },
    { key: 'commercial', icon: 'DollarSign', label: 'modules.workshop.stages.commercial', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', defaultCmdColor: '#a8edea' }
];

const DEFAULT_COMMANDS = {
    inspiration: [
        { id: 'default_1', title: 'Code Review Prompt', content: 'Review this code for best practices...' }
    ],
    pending: [
        { id: 'default_2', title: 'Deploy Pipeline', content: 'npm run deploy:main' }
    ],
    early: [
        { id: 'default_3', title: 'Git Status', content: 'git status' }
    ],
    growth: [
        { id: 'default_4', title: 'Full Scan', content: '/filescan' }
    ],
    advanced: [],
    commercial: []
};

// --- Stages API ---

export const getStages = async () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STAGES);
        if (!saved) return DEFAULT_STAGES;

        const parsed = JSON.parse(saved);

        // Validation & Migration: Ensure gradient colors for legacy data
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].color.includes('gradient')) {
            Logger.info('CommandTowerAPI', 'Migrating stages to gradient colors');
            return DEFAULT_STAGES.map(ds => {
                const existing = parsed.find(p => p.key === ds.key);
                return existing ? { ...existing, color: ds.color } : ds;
            }).concat(parsed.filter(p => !DEFAULT_STAGES.find(ds => ds.key === p.key)));
        }

        return parsed;
    } catch (error) {
        Logger.error('CommandTowerAPI', 'Failed to load stages', error);
        return DEFAULT_STAGES;
    }
};

export const saveStages = async (stages) => {
    try {
        localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify(stages));
        return stages;
    } catch (error) {
        Logger.error('CommandTowerAPI', 'Failed to save stages', error);
        throw error;
    }
};

// --- Commands API ---

export const getCommands = async () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.COMMANDS);
        return saved ? JSON.parse(saved) : DEFAULT_COMMANDS;
    } catch (error) {
        Logger.error('CommandTowerAPI', 'Failed to load commands', error);
        return DEFAULT_COMMANDS;
    }
};

export const saveCommands = async (commands) => {
    try {
        localStorage.setItem(STORAGE_KEYS.COMMANDS, JSON.stringify(commands));
        return commands;
    } catch (error) {
        Logger.error('CommandTowerAPI', 'Failed to save commands', error);
        throw error;
    }
};

export const generateId = () => nanoid();
