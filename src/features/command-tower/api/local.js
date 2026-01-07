import { nanoid } from 'nanoid';
import { Logger } from '@/utils/logger';

const STORAGE_KEYS = {
    STAGES: 'commandTowerStages'
};

const DEFAULT_STAGES = [
    { key: 'inspiration', icon: 'Lightbulb', label: 'modules.backlog.sections.inspiration', color: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
    { key: 'pending', icon: 'Rocket', label: 'modules.backlog.sections.pending', color: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)' },
    { key: 'early', icon: 'Sprout', label: 'modules.workshop.stages.early', color: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
    { key: 'growth', icon: 'TrendingUp', label: 'modules.workshop.stages.growth', color: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
    { key: 'advanced', icon: 'Award', label: 'modules.workshop.stages.advanced', color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
    { key: 'commercial', icon: 'DollarSign', label: 'modules.workshop.stages.commercial', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
];


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

export const generateId = () => nanoid();

