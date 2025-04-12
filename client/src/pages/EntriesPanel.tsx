import { FC, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertLotteryDraw, LotteryCategory, LotteryDraw } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validateLotteryDrawSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import DrawResult from "@/components/DrawResult";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EntriesPanelProps {
  category: LotteryCategory;
}

const EntriesPanel: FC<EntriesPanelProps> = ({ category }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query to fetch all draws for the current category
  const { data: draws, isLoading, error } = useQuery<LotteryDraw[]>({
    queryKey: [`/api/draws/${category}`],
  });

  // Form schema with additional validation
  const formSchema = validateLotteryDrawSchema.extend({
    // Check for unique ball numbers
    ball1: z.number().int().min(1).max(90),
    ball2: z.number().int().min(1).max(90),
    ball3: z.number().int().min(1).max(90),
    ball4: z.number().int().min(1).max(90),
    ball5: z.number().int().min(1).max(90),
  }).refine(
    (data) => {
      const balls = [data.ball1, data.ball2, data.ball3, data.ball4, data.ball5];
      return new Set(balls).size === 5;
    },
    {
      message: "Tous les numéros doivent être uniques",
      path: ["ball1"], // Will show the error on ball1 field
    }
  );

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category,
      drawDate: format(new Date(), "yyyy-MM-dd"),
      ball1: undefined,
      ball2: undefined,
      ball3: undefined,
      ball4: undefined,
      ball5: undefined,
    },
  });

  // Update category in form when it changes
  if (form.getValues("category") !== category) {
    form.setValue("category", category);
  }

  // Create mutation for adding a new draw
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
      form.reset({
        category,
        drawDate: format(new Date(), "yyyy-MM-dd"),
        ball1: undefined,
        ball2: undefined,
        ball3: undefined,
        ball4: undefined,
        ball5: undefined,
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer le tirage: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Delete draw mutation
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    createDrawMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    deleteDrawMutation.mutate(id);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Entrées de Tirage</h2>
        <p className="text-muted-foreground">Enregistrez les résultats du tirage de loterie</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="drawDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date du Tirage</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-muted text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Numéros Tirés (5 boules de 01 à 90)</Label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`ball${index}` as keyof z.infer<typeof formSchema>}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={90}
                              placeholder="##"
                              className="bg-muted text-foreground text-center font-mono"
                              {...field}
                              onChange={(e) => {
                                // Convert to number or undefined
                                const value = e.target.value ? parseInt(e.target.value) : undefined;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Entrez des nombres uniques entre 1 et 90
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  Enregistrer le Tirage
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4">Derniers Tirages Enregistrés</h3>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des données: {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : draws && draws.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-sm font-medium">Numéros Tirés</th>
                  <th className="px-4 py-3 text-sm font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {draws.map((draw) => (
                  <DrawResult
                    key={draw.id}
                    draw={draw}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-8">
              <p className="text-muted-foreground">
                Aucun tirage enregistré pour cette catégorie.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EntriesPanel;
