export const STAGES = {
    INSPIRATION: 'inspiration',
    PENDING: 'pending',
    EARLY: 'early',
    GROWTH: 'growth',
    ADVANCED: 'advanced',
    COMMERCIAL: 'commercial'
};

export const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
};

export const validateForNextStage = (item, nextStage) => {
    if (nextStage === STAGES.ADVANCED || nextStage === STAGES.COMMERCIAL) {
        if (!item.name || !item.name.trim()) return { valid: false, message: 'Name is required to proceed.' };
        if (!item.link || !item.link.trim()) return { valid: false, message: 'Connection (Link) is required to proceed.' };
    }
    return { valid: true };
};

export const getNextStage = (currentStage) => {
    switch (currentStage) {
        case STAGES.INSPIRATION: return STAGES.PENDING;
        case STAGES.PENDING: return STAGES.EARLY;
        case STAGES.EARLY: return STAGES.GROWTH;
        case STAGES.GROWTH: return STAGES.ADVANCED;
        case STAGES.ADVANCED: return STAGES.COMMERCIAL;
        default: return null;
    }
};
