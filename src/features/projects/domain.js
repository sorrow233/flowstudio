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

// Validates if a project can move to the next stage
export const validateForNextStage = (project, nextStage, stageCommands = []) => {
    // 1. Basic validation (Name, Link) - mainly for later stages but good to have.
    if (nextStage === STAGES.ADVANCED || nextStage === STAGES.COMMERCIAL) {
        if (!project.name || !project.name.trim()) return { valid: false, message: 'Name is required to proceed.' };
        if (!project.link || !project.link.trim()) return { valid: false, message: 'Connection (Link) is required to proceed.' };
    }

    // 2. Mandatory Commands Validation
    // Filter commands for the *current* stage (not nextStage, because we need to complete current stage's work)
    // Wait, the logic is "complete this stage to go to next".
    const currentStage = project.stage;

    // If we are validating movement *to* nextStage, we check *currentStage* completion.
    // However, if we just generally validate "can I leave this stage?", we look at current stage.

    const mandatoryCommands = stageCommands.filter(cmd =>
        (cmd.stage === currentStage || cmd.category === 'mandatory') && // Handle flexible schema
        cmd.category !== 'periodic' &&
        cmd.category !== 'troubleshooting'
        // fallback: if no category, assume mandatory? User said "First is mandatory... Second is periodic".
        // Let's assume if category is missing, it's mandatory for now, or explicit 'mandatory'.
    );

    // For now, let's assume all commands in the list passed in are RELEVANT for the gate.
    // Usually the caller will pass `towerCommands[currentStage]`.

    const completedIds = project.completedCommandIds || [];
    const missingMandatory = mandatoryCommands.filter(cmd => {
        const isMandatory = cmd.category === 'mandatory' || !cmd.category; // Default to mandatory
        return isMandatory && !completedIds.includes(cmd.id);
    });

    if (missingMandatory.length > 0) {
        return {
            valid: false,
            message: `You must complete ${missingMandatory.length} mandatory command(s) before proceeding.`,
            missingCommands: missingMandatory
        };
    }

    return { valid: true };
};

export const calculateStageProgress = (project, stageCommands = []) => {
    const mandatoryCommands = stageCommands.filter(cmd => cmd.category === 'mandatory' || !cmd.category);
    if (mandatoryCommands.length === 0) return 100;

    const completedIds = project.completedCommandIds || [];
    const completedCount = mandatoryCommands.filter(cmd => completedIds.includes(cmd.id)).length;

    return Math.round((completedCount / mandatoryCommands.length) * 100);
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
