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

// 现代清新的渐变色卡背景
const GRADIENT_BACKGROUNDS = [
    'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', // 清新薄荷
    'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', // 天空蓝
    'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', // 暖阳橙
    'linear-gradient(135deg, #FCE4EC 0%, #F8BBD9 100%)', // 樱花粉
    'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)', // 薰衣草
    'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)', // 青碧
    'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)', // 柠檬黄
    'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)', // 银灰
    'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)', // 靛蓝
    'linear-gradient(145deg, #f5f7fa 0%, #c3cfe2 100%)', // 极简白
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // 蜜桃
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // 糖果
];

const getRandomGradientBackground = () => {
    const index = Math.floor(Math.random() * GRADIENT_BACKGROUNDS.length);
    return GRADIENT_BACKGROUNDS[index];
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
        console.log('[useWorkshopItems] addProject:', stage, formData);
        const gradientBg = getRandomGradientBackground();
        const newItem = {
            name: formData.name || '',
            link: formData.link || '',
            goal: formData.goal || '',
            priority: formData.priority || 'medium',
            deadline: formData.deadline || null,
            backgroundType: 'gradient',
            backgroundValue: gradientBg,
            stage: stage,
            archived: false,
        };
        const result = await addMutation.mutateAsync(newItem);
        console.log('[useWorkshopItems] Added item:', result.id);
        return result.id;
    };

    const updateProject = (id, updates) => {
        console.log('[useWorkshopItems] updateProject:', id, updates);
        return updateMutation.mutateAsync({ id, updates });
    };
    const deleteProject = (id) => {
        console.log('[useWorkshopItems] deleteProject:', id);
        return deleteMutation.mutateAsync(id);
    };

    const toggleArchive = (id) => {
        const item = items.find(i => i.id === id);
        if (item) {
            console.log('[useWorkshopItems] toggleArchive:', id, !item.archived);
            updateProject(id, { archived: !item.archived });
        }
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
        console.log('[useWorkshopItems] moveItemToStage:', id, newStage);
        if (!Object.values(WORKSHOP_STAGES).includes(newStage)) {
            console.warn('[useWorkshopItems] Invalid stage:', newStage);
            return { success: false, message: 'Invalid stage for Workshop' };
        }
        const item = items.find(i => i.id === id);
        if (!item) return { success: false, message: 'Item not found' };

        const validation = validateForNextStage(item, newStage);
        if (!validation.valid) {
            console.warn('[useWorkshopItems] Validation failed:', validation.message);
            return { success: false, message: validation.message };
        }

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

        console.log('[useWorkshopItems] moveItemNext:', id, item.stage, '->', nextStage);

        const validation = validateForNextStage(item, nextStage);
        if (!validation.valid) {
            console.warn('[useWorkshopItems] Validation failed:', validation.message);
            return;
        }

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
