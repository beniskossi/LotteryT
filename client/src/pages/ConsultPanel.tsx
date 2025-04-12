import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { LotteryCategory, LotteryDraw } from "@shared/schema";
import BallNumber from "@/components/BallNumber";
import DrawResult from "@/components/DrawResult";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ConsultPanelProps {
  category: LotteryCategory;
}

interface ConsultationData {
  simultaneous: { ballNumber: number; frequency: number }[];
  subsequent: { ballNumber: number; frequency: number }[];
  drawHistory: LotteryDraw[];
}

const ConsultPanel: FC<ConsultPanelProps> = ({ category }) => {
  const [searchBall, setSearchBall] = useState<number | "">("");
  const [hasSearched, setHasSearched] = useState(false);

  // Query for consultation data
  const {
    data: consultData,
    isLoading,
    error,
    refetch,
  } = useQuery<ConsultationData>({
    queryKey: [`/api/consult/${category}/${searchBall}`],
    enabled: false, // Don't fetch automatically
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof searchBall === "number" && searchBall >= 1 && searchBall <= 90) {
      setHasSearched(true);
      refetch();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Consulter les Récurrences</h2>
        <p className="text-muted-foreground">Analysez les régularités d'apparition des numéros</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="searchNumber">Numéro de Boule à Rechercher</Label>
              <Input
                id="searchNumber"
                type="number"
                min={1}
                max={90}
                value={searchBall}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : "";
                  setSearchBall(value);
                }}
                className="mt-2 bg-muted text-foreground"
                placeholder="1-90"
                required
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Analyser
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors de la recherche: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : hasSearched && consultData ? (
        <>
          <Card className="mb-8">
            <CardHeader className="bg-muted border-b border-border">
              <CardTitle className="text-lg">
                Résultats pour la boule:{" "}
                <span className="text-primary font-bold">{searchBall}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <h4 className="text-md font-medium mb-4">Apparitions Simultanées</h4>
              {consultData.simultaneous.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full mb-6">
                    <thead className="bg-muted text-muted-foreground text-left">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium">Numéro</th>
                        <th className="px-4 py-3 text-sm font-medium">Fréquence</th>
                        <th className="px-4 py-3 text-sm font-medium">% des tirages</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {consultData.simultaneous.slice(0, 5).map((item, index) => {
                        const totalDraws = consultData.drawHistory.length;
                        const percentage = totalDraws > 0 
                          ? Math.round((item.frequency / totalDraws) * 100) 
                          : 0;
                        
                        return (
                          <tr key={item.ballNumber} className="hover:bg-muted">
                            <td className="px-4 py-3">
                              <BallNumber number={item.ballNumber} colorIndex={index % 5} />
                            </td>
                            <td className="px-4 py-3">{item.frequency}</td>
                            <td className="px-4 py-3">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground mb-6">Aucune donnée disponible.</p>
              )}

              <h4 className="text-md font-medium mb-4">Apparitions au Tirage Suivant</h4>
              {consultData.subsequent.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-muted text-muted-foreground text-left">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium">Numéro</th>
                        <th className="px-4 py-3 text-sm font-medium">Fréquence</th>
                        <th className="px-4 py-3 text-sm font-medium">% des tirages</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {consultData.subsequent.slice(0, 5).map((item, index) => {
                        const totalDraws = consultData.drawHistory.length;
                        const percentage = totalDraws > 0 
                          ? Math.round((item.frequency / totalDraws) * 100) 
                          : 0;
                        
                        return (
                          <tr key={item.ballNumber} className="hover:bg-muted">
                            <td className="px-4 py-3">
                              <BallNumber number={item.ballNumber} colorIndex={index % 5} />
                            </td>
                            <td className="px-4 py-3">{item.frequency}</td>
                            <td className="px-4 py-3">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune donnée disponible.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted border-b border-border">
              <CardTitle className="text-lg">
                Historique des Tirages avec la boule:{" "}
                <span className="text-primary font-bold">{searchBall}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              {consultData.drawHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-muted text-muted-foreground text-left">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-sm font-medium">Numéros Tirés</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {consultData.drawHistory.map((draw) => (
                        <DrawResult 
                          key={draw.id} 
                          draw={draw} 
                          highlightBall={searchBall as number}
                          showActions={false}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun tirage trouvé avec ce numéro.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : hasSearched ? (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <p className="text-muted-foreground">
              Aucune donnée trouvée pour la boule {searchBall} dans la catégorie {category}.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ConsultPanel;
