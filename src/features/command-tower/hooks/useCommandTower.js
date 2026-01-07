import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/local';

export const useCommandTower = () => {
    const queryClient = useQueryClient();

    // --- Queries ---

    const stagesQuery = useQuery({
        queryKey: ['command-tower', 'stages'],
        queryFn: api.getStages,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // --- Mutations: Stages ---

    const addStageMutation = useMutation({
        mutationFn: async (newStage) => {
            const currentStages = await api.getStages();
            // Check for duplicates handled in UI or here? Let's append.
            const updated = [...currentStages, newStage];
            return api.saveStages(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['command-tower', 'stages'] });
        }
    });

    const updateStageMutation = useMutation({
        mutationFn: async ({ key, updates }) => {
            const currentStages = await api.getStages();
            const updated = currentStages.map(s => s.key === key ? { ...s, ...updates } : s);
            return api.saveStages(updated);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['command-tower', 'stages'] });
        }
    });

    const deleteStageMutation = useMutation({
        mutationFn: async (stageKey) => {
            const currentStages = await api.getStages();
            const updatedStages = currentStages.filter(s => s.key !== stageKey);
            return api.saveStages(updatedStages);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['command-tower', 'stages'] });
        }
    });

    return {
        // Data
        stages: stagesQuery.data || [],
        isLoading: stagesQuery.isLoading,
        isError: stagesQuery.isError,

        // Actions
        addStage: addStageMutation.mutate,
        updateStage: updateStageMutation.mutate,
        deleteStage: deleteStageMutation.mutate
    };
};
