import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

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
        console.error("Error reading backlog items from localStorage", e);
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

    const addItem = async (stage = BACKLOG_STAGES.INSPIRATION, formData = {}) => {
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

    const updateItem = (id, updates) => updateMutation.mutateAsync({ id, updates });
    const deleteItem = (id) => deleteMutation.mutateAsync(id);

    const toggleArchive = (id) => {
        const item = items.find(i => i.id === id);
        if (item) updateItem(id, { archived: !item.archived });
    };

    const moveItemToStage = async (id, newStage) => {
        if (!Object.values(BACKLOG_STAGES).includes(newStage)) {
            return { success: false, message: 'Invalid stage for Backlog' };
        }
        await updateItem(id, { stage: newStage });
        return { success: true };
    };

    const moveItemNext = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        if (item.stage === BACKLOG_STAGES.INSPIRATION) {
            await updateItem(id, { stage: BACKLOG_STAGES.PENDING });
        }
        // pending 阶段的 "next" 是转入 Workshop，由 transferToWorkshop 处理
    };

    // 跨模块转移：将项目从 Backlog 转入 Workshop
    const transferToWorkshop = useCallback(async (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return { success: false, message: 'Item not found' };
        if (item.stage !== BACKLOG_STAGES.PENDING) {
            return { success: false, message: 'Only pending items can be transferred to Workshop' };
        }

        // 1. 读取 Workshop 数据
        const workshopKey = 'flow_workshop_items';
        let workshopItems = [];
        try {
            const raw = localStorage.getItem(workshopKey);
            workshopItems = raw ? JSON.parse(raw) : [];
        } catch (e) {
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

        // 3. 写入 Workshop
        localStorage.setItem(workshopKey, JSON.stringify([...workshopItems, workshopItem]));

        // 4. 从 Backlog 删除
        await deleteItem(id);

        // 5. 通知 Workshop 刷新（通过 invalidate 其 queryKey）
        queryClient.invalidateQueries({ queryKey: ['workshop-items'] });

        return { success: true };
    }, [items, deleteItem, queryClient]);

    return {
        items,
        loading: isLoading,
        addItem,
        updateItem,
        deleteItem,
        moveItemNext,
        moveItemToStage,
        toggleArchive,
        transferToWorkshop,
        STAGES: BACKLOG_STAGES,
    };
}
