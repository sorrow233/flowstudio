import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DataServiceFactory } from '@/services/data/DataServiceFactory';
import { useEffect } from 'react';
import { STAGES, generatePastelColor, validateForNextStage, getNextStage } from '@/features/projects/domain';

// Re-export STAGES for backward compatibility
export { STAGES };

export function useProjects() {
    const { currentUser, isGuest } = useAuth();
    const queryClient = useQueryClient();
    const service = DataServiceFactory.getService(currentUser, isGuest);

    const queryKey = ['projects', currentUser?.uid || 'guest', isGuest];

    // Initial Data Migration / Load
    useEffect(() => {
        service.init();
    }, [currentUser, isGuest, service]);

    const { data: items = [], isLoading, error } = useQuery({
        queryKey,
        queryFn: () => service.getItems(),
        staleTime: 1000 * 60, // 1 minute
    });

    const addMutation = useMutation({
        mutationFn: (item) => service.addItem(item),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => service.updateItem(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => service.deleteItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Helper functions to match legacy context API where possible
    const addItem = async (stage = STAGES.INSPIRATION, formData = {}) => {
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

    // Stage validation logic moved to domain.js

    const moveItemNext = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const nextStage = getNextStage(item.stage);
        if (!nextStage) return;

        const validation = validateForNextStage(item, nextStage);
        if (!validation.valid) return;

        await updateItem(id, { stage: nextStage });
    };

    const moveItemToStage = async (id, newStage) => {
        const itemToMove = items.find(i => i.id === id);
        if (!itemToMove) return { success: false, message: 'Item not found' };

        const validation = validateForNextStage(itemToMove, newStage);
        if (!validation.valid) return { success: false, message: validation.message };

        await updateItem(id, { stage: newStage });
        return { success: true };
    };

    return {
        items,
        loading: isLoading,
        addItem,
        updateItem,
        deleteItem,
        moveItemNext,
        moveItemToStage,
        toggleArchive,
        validateForNextStage
    };
}
