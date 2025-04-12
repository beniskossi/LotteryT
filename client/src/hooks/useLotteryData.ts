import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LotteryCategory, LotteryDraw, InsertLotteryDraw } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";

// Hook for managing lottery draw data
export function useLotteryData(category: LotteryCategory) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to fetch all draws for the category
  const {
    data: draws,
    isLoading,
    error,
  } = useQuery<LotteryDraw[]>({
    queryKey: [`/api/draws/${category}`],
  });

  // Mutation to create a new draw
  const createDrawMutation = useMutation({
    mutationFn: async (data: InsertLotteryDraw) => {
      const response = await apiRequest("POST", "/api/draws", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/draws/${category}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/statistics/${category}`] });
      toast({
        title: "Tirage enregistré",
        description: "Le tirage a été enregistré avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer le tirage: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a draw
  const deleteDrawMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/draws/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/draws/${category}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/statistics/${category}`] });
      toast({
        title: "Tirage supprimé",
        description: "Le tirage a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le tirage: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to reset all data for a category
  const resetCategoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/categories/${category}/reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/draws/${category}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/statistics/${category}`] });
      toast({
        title: "Données réinitialisées",
        description: `Les données de la catégorie ${category} ont été réinitialisées.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de réinitialiser les données: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    draws,
    isLoading,
    error,
    createDraw: createDrawMutation.mutate,
    isCreating: createDrawMutation.isPending,
    deleteDraw: deleteDrawMutation.mutate,
    isDeleting: deleteDrawMutation.isPending,
    resetCategory: resetCategoryMutation.mutate,
    isResetting: resetCategoryMutation.isPending,
  };
}
