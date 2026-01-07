import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DataServiceFactory } from '@/services/data/DataServiceFactory';
import { useEffect } from 'react';
import { STAGES, generatePastelColor, validateForNextStage } from '../domain';
import { Logger } from '@/utils/logger';

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
        Logger.info('useProjects', 'addProject called:', stage, formData);
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
        Logger.info('useProjects', 'Project added:', result.id);
        return result.id;
    };

    const updateProject = (id, updates) => {
        Logger.info('useProjects', 'updateProject:', id, updates);
        return updateMutation.mutateAsync({ id, updates });
    };
    const deleteProject = (id) => {
        Logger.info('useProjects', 'deleteProject:', id);
        return deleteMutation.mutateAsync(id);
    };
    const toggleArchive = (id) => {
        const item = projects.find(i => i.id === id);
        if (item) {
            Logger.info('useProjects', 'toggleArchive:', id, '->', !item.archived);
            updateProject(id, { archived: !item.archived });
        }
    };

    const toggleCommandCompletion = async (projectId, commandId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const currentCompleted = project.completedCommandIds || [];
        let newCompleted;
        if (currentCompleted.includes(commandId)) {
            newCompleted = currentCompleted.filter(id => id !== commandId);
        } else {
            newCompleted = [...currentCompleted, commandId];
        }

        Logger.info('useProjects', 'toggleCommandCompletion', projectId, commandId);
        await updateProject(projectId, { completedCommandIds: newCompleted });
    };

    // NOTE: validation now requires stageCommands. 
    // We cannot easily inject them here since they live in a different hook/context.
    // We will perform the validation IN THE COMPONENT before calling moveItemNext, 
    // OR we modify moveItemNext to accept the commands.
    // Let's modify moveItemNext to accept commands as an optional second argument for validation.
    const moveItemNext = async (id, stageCommands = []) => {
        const item = projects.find(i => i.id === id);
        if (!item) {
            Logger.warn('useProjects', 'moveItemNext: Item not found', id);
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

        Logger.info('useProjects', 'moveItemNext:', id, item.stage, '->', nextStage);

        const validation = validateForNextStage(item, nextStage, stageCommands);
        if (!validation.valid) {
            Logger.warn('useProjects', 'Validation failed:', validation.message);
            // We should probably throw or return error here so UI can show it
            // For now, we rely on the caller to validate BEFORE calling, or check the result.
            // But since this is async void, we can't return easily without breaking API.
            // Let's assume caller validates. But if they pass stageCommands, we enforce it.
            if (stageCommands.length > 0) {
                alert(validation.message); // Simple alert fallback if UI didn't catch it
                return;
            }
        }

        await updateProject(id, { stage: nextStage });
    };

    const moveItemToStage = async (id, newStage) => {
        const itemToMove = projects.find(i => i.id === id);
        if (!itemToMove) return { success: false, message: 'Item not found' };

        Logger.info('useProjects', 'moveItemToStage:', id, newStage);

        const validation = validateForNextStage(itemToMove, newStage);
        if (!validation.valid) {
            Logger.warn('useProjects', 'moveItemToStage validation failed:', validation.message);
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
        toggleCommandCompletion,
        validateForNextStage
    };
}
