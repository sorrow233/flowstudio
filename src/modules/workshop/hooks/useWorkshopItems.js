import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export const WORKSHOP_STAGES = {
    EARLY: 'early',
    GROWTH: 'growth',
    ADVANCED: 'advanced',
    COMMERCIAL: 'commercial'
};

const STORAGE_KEY = 'flow_workshop_items';

const getLocalItems = () => {
    try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        console.error("Error reading workshop items from localStorage", e);
        return [];
    }
};

const setLocalItems = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
};

const generateId = () => `workshop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function useWorkshopItems() {
    const { currentUser, isGuest } = useAuth();
    const queryClient = useQueryClient();
    const queryKey = ['workshop-items', currentUser?.uid || 'guest', isGuest];

    const { data: items = [], isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            await new Promise(r => setTimeout(r, 50));
            return getLocalItems();
        },
        staleTime: 1000 * 60,
    });

    const addMutation = useMutation({
        mutationFn: async (item) => {
            const items = getLocalItems();
            const newItem = { ...item, id: generateId(), createdAt: new Date().toISOString() };
            setLocalItems([...items, newItem]);
            return newItem;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const items = getLocalItems();
            const nextItems = items.map(item =>
                item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
            );
            setLocalItems(nextItems);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const items = getLocalItems();
            setLocalItems(items.filter(i => i.id !== id));
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const addProject = async (stage = WORKSHOP_STAGES.EARLY, formData = {}) => {
        const newItem = {
            name: formData.name || '',
            link: formData.link || '',
            goal: formData.goal || '',
            priority: formData.priority || 'medium',
            deadline: formData.deadline || null,
            color: generatePastelColor(),
            stage: stage,
            archived: false,
        };
        const result = await addMutation.mutateAsync(newItem);
        return result.id;
    };

    const updateProject = (id, updates) => updateMutation.mutateAsync({ id, updates });
    const deleteProject = (id) => deleteMutation.mutateAsync(id);

    const toggleArchive = (id) => {
        const item = items.find(i => i.id === id);
        if (item) updateProject(id, { archived: !item.archived });
    };

    // Stage validation for advanced stages
    const validateForNextStage = (item, nextStage) => {
        if (nextStage === WORKSHOP_STAGES.ADVANCED || nextStage === WORKSHOP_STAGES.COMMERCIAL) {
            if (!item.name || !item.name.trim()) return { valid: false, message: 'Name is required to proceed.' };
            if (!item.link || !item.link.trim()) return { valid: false, message: 'Connection (Link) is required to proceed.' };
        }
        return { valid: true };
    };

    const moveItemToStage = async (id, newStage) => {
        if (!Object.values(WORKSHOP_STAGES).includes(newStage)) {
            return { success: false, message: 'Invalid stage for Workshop' };
        }
        const item = items.find(i => i.id === id);
        if (!item) return { success: false, message: 'Item not found' };

        const validation = validateForNextStage(item, newStage);
        if (!validation.valid) return { success: false, message: validation.message };

        await updateProject(id, { stage: newStage });
        return { success: true };
    };

    const moveItemNext = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        let nextStage;
        switch (item.stage) {
            case WORKSHOP_STAGES.EARLY: nextStage = WORKSHOP_STAGES.GROWTH; break;
            case WORKSHOP_STAGES.GROWTH: nextStage = WORKSHOP_STAGES.ADVANCED; break;
            case WORKSHOP_STAGES.ADVANCED: nextStage = WORKSHOP_STAGES.COMMERCIAL; break;
            default: return; // commercial 没有下一阶段
        }

        const validation = validateForNextStage(item, nextStage);
        if (!validation.valid) return;

        await updateProject(id, { stage: nextStage });
    };

    return {
        projects: items,
        loading: isLoading,
        addProject,
        updateProject,
        deleteProject,
        moveItemNext,
        moveItemToStage,
        toggleArchive,
        validateForNextStage,
        STAGES: WORKSHOP_STAGES,
    };
}
