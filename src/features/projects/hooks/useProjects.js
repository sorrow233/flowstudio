import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DataServiceFactory } from '@/services/data/DataServiceFactory';
import { useEffect } from 'react';
import { STAGES, generatePastelColor, validateForNextStage } from '../domain';

export function useProjects() {
    const { currentUser, isGuest } = useAuth();
    const queryClient = useQueryClient();
    const service = DataServiceFactory.getService(currentUser, isGuest);

    const queryKey = ['projects', currentUser?.uid || 'guest', isGuest];

    // Initial Data Migration / Load
    useEffect(() => {
        service.init();
    }, [currentUser, isGuest, service]);

    const { data: projects = [], isLoading, error } = useQuery({
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
    const addProject = async (stage = STAGES.INSPIRATION, formData = {}) => {
        console.log('[useProjects] addProject called:', stage, formData);
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
        console.log('[useProjects] Project added:', result.id);
        return result.id;
    };

    const updateProject = (id, updates) => {
        console.log('[useProjects] updateProject:', id, updates);
        return updateMutation.mutateAsync({ id, updates });
    };
    const deleteProject = (id) => {
        console.log('[useProjects] deleteProject:', id);
        return deleteMutation.mutateAsync(id);
    };
    const toggleArchive = (id) => {
        const item = projects.find(i => i.id === id);
        if (item) {
            console.log('[useProjects] toggleArchive:', id, '->', !item.archived);
            updateProject(id, { archived: !item.archived });
        }
    };

    const moveItemNext = async (id) => {
        const item = projects.find(i => i.id === id);
        if (!item) {
            console.warn('[useProjects] moveItemNext: Item not found', id);
            return;
        }

        let nextStage = item.stage;
        switch (item.stage) {
            case STAGES.INSPIRATION: nextStage = STAGES.PENDING; break;
            case STAGES.PENDING: nextStage = STAGES.EARLY; break;
            case STAGES.EARLY: nextStage = STAGES.GROWTH; break;
            case STAGES.GROWTH: nextStage = STAGES.ADVANCED; break;
            case STAGES.ADVANCED: nextStage = STAGES.COMMERCIAL; break;
            default: return;
        }

        console.log('[useProjects] moveItemNext:', id, item.stage, '->', nextStage);

        const validation = validateForNextStage(item, nextStage);
        if (!validation.valid) {
            console.warn('[useProjects] Validation failed:', validation.message);
            return;
        }

        await updateProject(id, { stage: nextStage });
    };

    const moveItemToStage = async (id, newStage) => {
        const itemToMove = projects.find(i => i.id === id);
        if (!itemToMove) return { success: false, message: 'Item not found' };

        console.log('[useProjects] moveItemToStage:', id, newStage);

        const validation = validateForNextStage(itemToMove, newStage);
        if (!validation.valid) {
            console.warn('[useProjects] moveItemToStage validation failed:', validation.message);
            return { success: false, message: validation.message };
        }

        await updateProject(id, { stage: newStage });
        return { success: true };
    };

    return {
        projects,
        loading: isLoading,
        addProject,
        updateProject,
        deleteProject,
        moveItemNext,
        moveItemToStage,
        toggleArchive,
        validateForNextStage
    };
}
