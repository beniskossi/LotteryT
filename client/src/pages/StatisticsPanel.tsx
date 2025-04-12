import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LotteryCategory } from "@shared/schema";
import BallNumber from "@/components/BallNumber";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StatisticsPanelProps {
  category: LotteryCategory;
}

interface StatisticsData {
  topFrequent: { ballNumber: number; frequency: number }[];
  leastFrequent: { ballNumber: number; frequency: number }[];
  allFrequencies: { ballNumber: number; frequency: number }[];
}

const StatisticsPanel: FC<StatisticsPanelProps> = ({ category }) => {
  // Query for statistics data
  const { data, isLoading, error } = useQuery<StatisticsData>({
    queryKey: [`/api/statistics/${category}`],
  });

  // Calculate max frequency for percentage calculations
  const maxFrequency = data?.allFrequencies.reduce(
    (max, item) => Math.max(max, item.frequency),
    0
  ) || 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Statistiques</h2>
        <p className="text-muted-foreground">Analysez la fréquence d'apparition des numéros</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement des statistiques: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Boules les Plus Fréquentes</h3>
                <div className="space-y-4">
                  {data.topFrequent.map((ball, index) => {
                    const percentage = maxFrequency > 0 
                      ? Math.round((ball.frequency / maxFrequency) * 100) 
                      : 0;
                    
                    return (
                      <div key={ball.ballNumber} className="flex items-center">
                        <BallNumber number={ball.ballNumber} colorIndex={index} className="mr-4" />
                        <div className="flex-grow">
                          <Progress value={percentage} className="h-4" />
                        </div>
                        <span className="ml-3 text-sm font-mono">
                          {ball.frequency} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Boules les Moins Fréquentes</h3>
                <div className="space-y-4">
                  {data.leastFrequent.map((ball, index) => {
                    const percentage = maxFrequency > 0 
                      ? Math.round((ball.frequency / maxFrequency) * 100) 
                      : 0;
                    
                    return (
                      <div key={ball.ballNumber} className="flex items-center">
                        <BallNumber number={ball.ballNumber} colorIndex={index} className="mr-4" />
                        <div className="flex-grow">
                          <Progress value={percentage} className="h-4 bg-muted" 
                            indicatorClassName="bg-destructive" />
                        </div>
                        <span className="ml-3 text-sm font-mono">
                          {ball.frequency} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader className="bg-muted border-b border-border">
              <CardTitle className="text-lg">Distribution des Numéros</CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="h-64 w-full relative mb-6">
                {data.allFrequencies.map((item, index) => {
                  const percentage = maxFrequency > 0 
                    ? (item.frequency / maxFrequency) * 100
                    : 0;
                  const position = (index / data.allFrequencies.length) * 100;
                  
                  return (
                    <div
                      key={item.ballNumber}
                      className="absolute bottom-0 bg-primary rounded-t-sm"
                      style={{
                        left: `${position}%`,
                        height: `${percentage}%`,
                        width: '1.1%',
                        backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`,
                      }}
                      title={`${item.ballNumber}: ${item.frequency}`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground text-center mb-2">
                Numéros de Boule (1-90)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted border-b border-border">
              <CardTitle className="text-lg">Toutes les Boules par Fréquence</CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
                {data.allFrequencies
                  .sort((a, b) => a.ballNumber - b.ballNumber)
                  .map((item) => {
                    const opacity = maxFrequency > 0 
                      ? 0.2 + (item.frequency / maxFrequency) * 0.8
                      : 0.2;
                    const percentage = maxFrequency > 0 
                      ? Math.round((item.frequency / maxFrequency) * 100)
                      : 0;
                    
                    return (
                      <div key={item.ballNumber} className="relative flex flex-col items-center">
                        <div 
                          className="rounded-full flex items-center justify-center font-mono font-medium w-10 h-10 text-sm text-white"
                          style={{ backgroundColor: `rgba(var(--primary-rgb), ${opacity})` }}
                        >
                          {item.ballNumber < 10 ? `0${item.ballNumber}` : item.ballNumber}
                        </div>
                        <div className="text-xs text-center mt-1">{percentage}%</div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <p className="text-muted-foreground">
              Aucune donnée statistique disponible pour la catégorie {category}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatisticsPanel;
