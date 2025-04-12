import { FC } from "react";
import { FileEdit, Copy, BarChart, Trash2 } from "lucide-react";
import { LotteryCategory } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  category: LotteryCategory;
  activeTab: "entries" | "consult" | "statistics";
  setActiveTab: (tab: "entries" | "consult" | "statistics") => void;
  categoryDescription: string;
}

const Sidebar: FC<SidebarProps> = ({
  category,
  activeTab,
  setActiveTab,
  categoryDescription,
}) => {
  const { toast } = useToast();

  const resetMutation = useMutation({
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

  const handleReset = () => {
    resetMutation.mutate();
  };

  return (
    <aside className="hidden md:block w-64 bg-card overflow-y-auto">
      <div className="py-4">
        <div className="px-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">{category}</h2>
          <p className="text-muted-foreground text-sm">{categoryDescription}</p>
        </div>

        <nav>
          <ul>
            <li className="mb-1">
              <button
                onClick={() => setActiveTab("entries")}
                className={`flex items-center px-4 py-3 w-full text-left ${
                  activeTab === "entries"
                    ? "text-foreground bg-primary/20 border-l-4 border-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <FileEdit className="h-5 w-5 mr-3" />
                Entrées
              </button>
            </li>
            <li className="mb-1">
              <button
                onClick={() => setActiveTab("consult")}
                className={`flex items-center px-4 py-3 w-full text-left ${
                  activeTab === "consult"
                    ? "text-foreground bg-primary/20 border-l-4 border-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Copy className="h-5 w-5 mr-3" />
                Consulter
              </button>
            </li>
            <li className="mb-1">
              <button
                onClick={() => setActiveTab("statistics")}
                className={`flex items-center px-4 py-3 w-full text-left ${
                  activeTab === "statistics"
                    ? "text-foreground bg-primary/20 border-l-4 border-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <BarChart className="h-5 w-5 mr-3" />
                Statistiques
              </button>
            </li>
          </ul>
        </nav>

        <div className="px-4 mt-8">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center justify-center w-full py-2 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors">
                <Trash2 className="h-5 w-5 mr-2" />
                Réinitialiser les données
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous certain?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va supprimer toutes les données de la catégorie {category}. Cette
                  action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-white">
                  Réinitialiser
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
