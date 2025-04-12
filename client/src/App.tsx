import { useState, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Layout from "./components/Layout";
import EntriesPanel from "./pages/EntriesPanel";
import ConsultPanel from "./pages/ConsultPanel";
import StatisticsPanel from "./pages/StatisticsPanel";
import NotFound from "@/pages/not-found";
import { LotteryCategory } from "@shared/schema";
import { useSessionStorage } from "./lib/utils";

function AppRouter() {
  const [category, setCategory] = useSessionStorage<LotteryCategory>("lottery-category", "GH18");
  const [activeTab, setActiveTab] = useSessionStorage<"entries" | "consult" | "statistics">("active-tab", "entries");

  return (
    <Router>
      <Layout
        category={category}
        setCategory={setCategory}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <Switch>
          <Route path="/">
            {activeTab === "entries" && <EntriesPanel category={category} />}
            {activeTab === "consult" && <ConsultPanel category={category} />}
            {activeTab === "statistics" && <StatisticsPanel category={category} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
