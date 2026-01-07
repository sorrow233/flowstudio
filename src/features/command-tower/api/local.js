import { v4 as uuidv4 } from 'uuid';

const COMMANDS_STORAGE_KEY = 'commandTowerData';
const STAGES_STORAGE_KEY = 'commandTowerStages';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Helpers ---

const getLocalCommands = () => {
    try {
        const item = localStorage.getItem(COMMANDS_STORAGE_KEY);
        return item ? JSON.parse(item) : getDefaultCommands();
    } catch (e) {
        console.error("Error reading commands from local storage", e);
        return getDefaultCommands();
    }
};

const setLocalCommands = (commands) => {
    localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(commands));
};

const getLocalStages = () => {
    try {
        const item = localStorage.getItem(STAGES_STORAGE_KEY);
        return item ? JSON.parse(item) : getDefaultStages();
    } catch (e) {
        console.error("Error reading stages from local storage", e);
        return getDefaultStages();
    }
};

const setLocalStages = (stages) => {
    localStorage.setItem(STAGES_STORAGE_KEY, JSON.stringify(stages));
};

const getDefaultCommands = () => ({
    inspiration: [
        { id: uuidv4(), title: 'Code Review Prompt', content: 'Review this code for best practices...', color: '#d4fc79' }
    ],
    pending: [
        { id: uuidv4(), title: 'Deploy Pipeline', content: 'npm run deploy:main', color: '#f093fb' }
    ],
    early: [
        { id: uuidv4(), title: 'Git Status', content: 'git status', color: '#84fab0' }
    ],
    growth: [
        { id: uuidv4(), title: 'Full Scan', content: '/filescan', color: '#fccb90' }
    ],
    advanced: [],
    commercial: []
});

const getDefaultStages = () => [
    { key: 'inspiration', icon: 'Lightbulb', label: 'modules.backlog.sections.inspiration', color: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', defaultCmdColor: '#d4fc79' },
    { key: 'pending', icon: 'Rocket', label: 'modules.backlog.sections.pending', color: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', defaultCmdColor: '#f093fb' },
    { key: 'early', icon: 'Sprout', label: 'modules.workshop.stages.early', color: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', defaultCmdColor: '#84fab0' },
    { key: 'growth', icon: 'TrendingUp', label: 'modules.workshop.stages.growth', color: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', defaultCmdColor: '#fccb90' },
    { key: 'advanced', icon: 'Award', label: 'modules.workshop.stages.advanced', color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', defaultCmdColor: '#e0c3fc' },
    { key: 'commercial', icon: 'DollarSign', label: 'modules.workshop.stages.commercial', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', defaultCmdColor: '#a8edea' }
];

// --- API ---

// Commands
export const fetchCommands = async () => {
    await delay(50);
    return getLocalCommands();
};

export const addCommand = async (_, { stage, ...commandData }) => {
    await delay(50);
    const commands = getLocalCommands();
    const newCommand = {
        id: uuidv4(),
        ...commandData
    };

    const nextCommands = {
        ...commands,
        [stage]: [...(commands[stage] || []), newCommand]
    };

    setLocalCommands(nextCommands);
    return newCommand;
};

export const updateCommand = async (_, { stage, id, updates }) => {
    await delay(50);
    const commands = getLocalCommands();
    if (!commands[stage]) return null;

    let updatedCommand = null;
    const nextStageCommands = commands[stage].map(cmd => {
        if (cmd.id === id) {
            updatedCommand = { ...cmd, ...updates };
            return updatedCommand;
        }
        return cmd;
    });

    const nextCommands = {
        ...commands,
        [stage]: nextStageCommands
    };

    setLocalCommands(nextCommands);
    return updatedCommand;
};

export const deleteCommand = async (_, { stage, id }) => {
    await delay(50);
    const commands = getLocalCommands();
    if (!commands[stage]) return;

    const nextCommands = {
        ...commands,
        [stage]: commands[stage].filter(cmd => cmd.id !== id)
    };

    setLocalCommands(nextCommands);
};

// Stages
export const fetchStages = async () => {
    await delay(50);
    // Migration logic could go here if needed, but keeping it simple for now
    let stages = getLocalStages();

    // Safety check to ensure defaults exist if storage is empty or weird
    if (!stages || stages.length === 0) {
        stages = getDefaultStages();
        setLocalStages(stages);
    }

    return stages;
};

export const addStage = async (_, stageData) => {
    await delay(50);
    const stages = getLocalStages();
    // Assuming stageData includes key, label, color, etc.
    // If key is not provided, generate one? But UI usually does custom_${Date.now()}
    // Let's replace Date.now() in key generation with uuid if we can, but the UI might trigger it. 
    // Actually, let's let the hook or UI decide the key or generate it here if missing.
    // User asked to replace Date.now() for ID generation.

    const newStage = {
        ...stageData,
        key: stageData.key || `custom_${uuidv4()}`
    };

    const nextStages = [...stages, newStage];
    setLocalStages(nextStages);

    // Also initialize commands array for this stage
    const commands = getLocalCommands();
    if (!commands[newStage.key]) {
        setLocalCommands({
            ...commands,
            [newStage.key]: []
        });
    }

    return newStage;
};

export const updateStage = async (_, { key, updates }) => {
    await delay(50);
    const stages = getLocalStages();
    const nextStages = stages.map(s => s.key === key ? { ...s, ...updates } : s);
    setLocalStages(nextStages);
};

export const deleteStage = async (_, key) => {
    await delay(50);
    const stages = getLocalStages();
    const nextStages = stages.filter(s => s.key !== key);
    setLocalStages(nextStages);

    // Also remove commands
    const commands = getLocalCommands();
    const nextCommands = { ...commands };
    delete nextCommands[key];
    setLocalCommands(nextCommands);
};
