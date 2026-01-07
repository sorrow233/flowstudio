import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/local';

export const useCommandTower = () => {
    const queryClient = useQueryClient();

    // --- Queries ---

    const stagesQuery = useQuery({
        queryKey: ['dates', 'stages'],
        queryFn: api.getStages,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const commandsQuery = useQuery({
        queryKey: ['dates', 'commands'],
        queryFn: api.getCommands,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // --- Mutations: Stages ---

    const addStageMutation = useMutation({
        mutationFn: async (newStage) => {
            const currentStages = await api.getStages();
            // Check for duplicates handled in UI or here? Let's append.
            const updated = [...currentStages, newStage];
            await api.saveStages(updated);

            // Also initialize command list for this stage
            const currentCommands = await api.getCommands();
            if (!currentCommands[newStage.key]) {
                const updatedCmds = { ...currentCommands, [newStage.key]: [] };
                await api.saveCommands(updatedCmds);
            }

            return { stages: updated };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dates', 'stages'] });
            queryClient.invalidateQueries({ queryKey: ['dates', 'commands'] });
        }
    });

    const updateStageMutation = useMutation({
        mutationFn: async ({ key, updates }) => {
            const currentStages = await api.getStages();
            const updated = currentStages.map(s => s.key === key ? { ...s, ...updates } : s);
            return api.saveStages(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dates', 'stages'] });
        }
    });

    const deleteStageMutation = useMutation({
        mutationFn: async (stageKey) => {
            const currentStages = await api.getStages();
            const updatedStages = currentStages.filter(s => s.key !== stageKey);
            await api.saveStages(updatedStages);

            const currentCommands = await api.getCommands();
            const updatedCommands = { ...currentCommands };
            delete updatedCommands[stageKey];
            await api.saveCommands(updatedCommands);

            return { stages: updatedStages, commands: updatedCommands };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dates', 'stages'] });
            queryClient.invalidateQueries({ queryKey: ['dates', 'commands'] });
        }
    });

    // --- Mutations: Commands ---

    const addCommandMutation = useMutation({
        mutationFn: async ({ stageKey, command }) => {
            const currentCommands = await api.getCommands();
            const stageCommands = currentCommands[stageKey] || [];

            const newCommand = {
                ...command,
                id: api.generateId() // Use nanoid here
            };

            const updated = {
                ...currentCommands,
                [stageKey]: [...stageCommands, newCommand]
            };
            return api.saveCommands(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dates', 'commands'] });
        }
    });

    const updateCommandMutation = useMutation({
        mutationFn: async ({ stageKey, command }) => {
            const currentCommands = await api.getCommands();
            const stageCommands = currentCommands[stageKey] || [];

            const updatedStageCommands = stageCommands.map(cmd =>
                cmd.id === command.id ? command : cmd
            );

            const updated = {
                ...currentCommands,
                [stageKey]: updatedStageCommands
            };
            return api.saveCommands(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dates', 'commands'] });
        }
    });

    const deleteCommandMutation = useMutation({
        mutationFn: async ({ stageKey, commandId }) => {
            const currentCommands = await api.getCommands();
            const stageCommands = currentCommands[stageKey] || [];

            const updatedStageCommands = stageCommands.filter(cmd => cmd.id !== commandId);

            const updated = {
                ...currentCommands,
                [stageKey]: updatedStageCommands
            };
            return api.saveCommands(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dates', 'commands'] });
        }
    });

    return {
        // Data
        stages: stagesQuery.data || [],
        commands: commandsQuery.data || {},
        isLoading: stagesQuery.isLoading || commandsQuery.isLoading,
        isError: stagesQuery.isError || commandsQuery.isError,

        // Actions
        addStage: addStageMutation.mutate,
        updateStage: updateStageMutation.mutate,
        deleteStage: deleteStageMutation.mutate,

        addCommand: addCommandMutation.mutate,
        updateCommand: updateCommandMutation.mutate,
        deleteCommand: deleteCommandMutation.mutate
    };
};
