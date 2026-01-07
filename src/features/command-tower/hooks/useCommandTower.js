import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/local';
import { Logger } from '@/utils/logger';

export function useCommandTower() {
    const queryClient = useQueryClient();

    // keys
    const commandsKey = ['command-tower', 'commands'];
    const stagesKey = ['command-tower', 'stages'];

    // --- Queries ---

    const { data: commands = {}, isLoading: isLoadingCommands } = useQuery({
        queryKey: commandsKey,
        queryFn: api.fetchCommands,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const { data: stages = [], isLoading: isLoadingStages } = useQuery({
        queryKey: stagesKey,
        queryFn: api.fetchStages,
        staleTime: 1000 * 60 * 5,
    });

    // --- Mutations ---

    // Commands
    const addCommandMutation = useMutation({
        mutationFn: (data) => api.addCommand(null, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commandsKey });
        }
    });

    const updateCommandMutation = useMutation({
        mutationFn: (data) => api.updateCommand(null, data), // data: { stage, id, updates }
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commandsKey });
        }
    });

    const deleteCommandMutation = useMutation({
        mutationFn: (data) => api.deleteCommand(null, data), // data: { stage, id }
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commandsKey });
        }
    });

    // Stages
    const addStageMutation = useMutation({
        mutationFn: (data) => api.addStage(null, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stagesKey });
            queryClient.invalidateQueries({ queryKey: commandsKey }); // New stage initializes empty commands
        }
    });

    const updateStageMutation = useMutation({
        mutationFn: (data) => api.updateStage(null, data), // data: { key, updates }
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stagesKey });
        }
    });

    const deleteStageMutation = useMutation({
        mutationFn: (key) => api.deleteStage(null, key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: stagesKey });
            queryClient.invalidateQueries({ queryKey: commandsKey });
        }
    });

    // --- Wrapper Functions ---

    const addCommand = async (stage, commandData) => {
        Logger.info('useCommandTower', 'addCommand', stage, commandData);
        return addCommandMutation.mutateAsync({ stage, ...commandData });
    };

    const updateCommand = async (stage, id, updates) => {
        Logger.info('useCommandTower', 'updateCommand', stage, id, updates);
        return updateCommandMutation.mutateAsync({ stage, id, updates });
    };

    const deleteCommand = async (stage, id) => {
        Logger.info('useCommandTower', 'deleteCommand', stage, id);
        return deleteCommandMutation.mutateAsync({ stage, id });
    };

    const addStage = async (stageData) => {
        Logger.info('useCommandTower', 'addStage', stageData);
        return addStageMutation.mutateAsync(stageData);
    };

    const updateStage = async (key, updates) => {
        Logger.info('useCommandTower', 'updateStage', key, updates);
        return updateStageMutation.mutateAsync({ key, updates });
    };

    const deleteStage = async (key) => {
        Logger.info('useCommandTower', 'deleteStage', key);
        return deleteStageMutation.mutateAsync(key);
    };

    return {
        commands,
        stages,
        isLoading: isLoadingCommands || isLoadingStages,
        addCommand,
        updateCommand,
        deleteCommand,
        addStage,
        updateStage,
        deleteStage
    };
}
