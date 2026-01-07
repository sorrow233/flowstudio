import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import { Logger } from '@/utils/logger';

export const BACKLOG_STAGES = {
    INSPIRATION: 'inspiration',
    PENDING: 'pending'
};

const STORAGE_KEY = 'flow_backlog_items';

const getLocalItems = () => {
    try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        Logger.error('useBacklogItems', 'Error reading backlog items from localStorage', e);
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

const generateId = () => `backlog_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function useBacklogItems() {
    const { currentUser, isGuest } = useAuth();
    const queryClient = useQueryClient();
    const queryKey = ['backlog-items', currentUser?.uid || 'guest', isGuest];

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

    const addProject = async (stage = BACKLOG_STAGES.INSPIRATION, formData = {}) => {
        Logger.info('useBacklogItems', 'addProject:', stage, formData);
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
        Logger.info('useBacklogItems', 'Added item:', result.id);
        return result.id;
    };

    const updateProject = (id, updates) => {
        Logger.info('useBacklogItems', 'updateProject:', id, updates);
        return updateMutation.mutateAsync({ id, updates });
    };
    const deleteProject = (id) => {
        Logger.info('useBacklogItems', 'deleteProject:', id);
        return deleteMutation.mutateAsync(id);
    };

    const toggleArchive = (id) => {
        const item = items.find(i => i.id === id);
        if (item) {
            Logger.info('useBacklogItems', 'toggleArchive:', id, !item.archived);
            updateProject(id, { archived: !item.archived });
        }
    };

    const moveItemToStage = async (id, newStage) => {
        Logger.info('useBacklogItems', 'moveItemToStage:', id, newStage);
        if (!Object.values(BACKLOG_STAGES).includes(newStage)) {
            Logger.warn('useBacklogItems', 'Invalid stage:', newStage);
            return { success: false, message: 'Invalid stage for Backlog' };
        }
        await updateProject(id, { stage: newStage });
        return { success: true };
    };

    const moveItemNext = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        Logger.info('useBacklogItems', 'moveItemNext:', id, item.stage);
        if (item.stage === BACKLOG_STAGES.INSPIRATION) {
            await updateProject(id, { stage: BACKLOG_STAGES.PENDING });
        }
        // pending 阶段的 "next" 是转入 Workshop，由 transferToWorkshop 处理
    };

    // 跨模块转移：将项目从 Backlog 转入 Workshop
    const transferToWorkshop = useCallback(async (id) => {
        Logger.info('useBacklogItems', 'transferToWorkshop called for:', id);
        const item = items.find(i => i.id === id);
        if (!item) return { success: false, message: 'Item not found' };
        if (item.stage !== BACKLOG_STAGES.PENDING) {
            Logger.warn('useBacklogItems', 'Transfer failed: item not in Pending');
            return { success: false, message: 'Only pending items can be transferred to Workshop' };
        }

        // 1. 读取 Workshop 数据
        const workshopKey = 'flow_workshop_items';
        let workshopItems = [];
        try {
            const raw = localStorage.getItem(workshopKey);
            workshopItems = raw ? JSON.parse(raw) : [];
        } catch (e) {
            Logger.error('useBacklogItems', 'Failed to read workshop items during transfer', e);
            workshopItems = [];
        }

        // 2. 创建 Workshop 项目（转换阶段为 early）
        const workshopItem = {
            ...item,
            id: `workshop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            stage: 'early',
            transferredAt: new Date().toISOString(),
            sourceBacklogId: item.id,
        };

        Logger.info('useBacklogItems', 'Creating new workshop item:', workshopItem.id);

        // 3. 写入 Workshop
        localStorage.setItem(workshopKey, JSON.stringify([...workshopItems, workshopItem]));

        // 4. 从 Backlog 删除
        await deleteProject(id);
        Logger.info('useBacklogItems', 'Item transferred and deleted from Backlog');

        // 5. 通知 Workshop 刷新（通过 invalidate 其 queryKey）
        queryClient.invalidateQueries({ queryKey: ['workshop-items'] });

        return { success: true };
    }, [items, deleteProject, queryClient]);

    return {
        projects: items,
        loading: isLoading,
        addProject,
        updateProject,
        deleteProject,
        moveItemNext,
        moveItemToStage,
        toggleArchive,
        transferToWorkshop,
        STAGES: BACKLOG_STAGES,
    };
}
