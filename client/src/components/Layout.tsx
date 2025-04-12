import { FC, ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { LotteryCategory } from "@shared/schema";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  category: LotteryCategory;
  setCategory: (category: LotteryCategory) => void;
  activeTab: "entries" | "consult" | "statistics";
  setActiveTab: (tab: "entries" | "consult" | "statistics") => void;
}

const Layout: FC<LayoutProps> = ({
  children,
  category,
  setCategory,
  activeTab,
  setActiveTab,
}) => {
  const { canInstall, handleInstall } = useInstallPrompt();

  const categoryDescriptions = {
    GH18: "Tirage de la loterie du Ghana à 18h",
    CIV10: "Tirage de la loterie de Côte d'Ivoire à 10h",
    CIV13: "Tirage de la loterie de Côte d'Ivoire à 13h",
    CIV16: "Tirage de la loterie de Côte d'Ivoire à 16h",
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-md z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            <span className="text-white">system</span>E
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {["GH18", "CIV10", "CIV13", "CIV16"].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setCategory(cat as LotteryCategory)}
                    className={`py-2 px-4 rounded-md font-medium transition-colors ${
                      category === cat
                        ? "border border-primary text-primary hover:bg-primary/20"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center">
            {canInstall && (
              <Button
                onClick={handleInstall}
                className="bg-secondary hover:bg-secondary/90 text-white"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Installer
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-hidden flex">
        {/* Sidebar (Desktop) */}
        <Sidebar
          category={category}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          categoryDescription={categoryDescriptions[category]}
        />

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto">
          {/* Mobile Category Selection */}
          <div className="md:hidden overflow-x-auto">
            <div className="flex p-2 space-x-2 whitespace-nowrap">
              {["GH18", "CIV10", "CIV13", "CIV16"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as LotteryCategory)}
                  className={`py-2 px-4 rounded-md font-medium transition-colors ${
                    category === cat
                      ? "border border-primary text-primary bg-primary/10"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Section Tabs */}
          <div className="md:hidden bg-card">
            <div className="flex text-sm">
              {["entries", "consult", "statistics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "entries" | "consult" | "statistics")}
                  className={`flex-1 py-3 font-medium ${
                    activeTab === tab
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab === "entries" ? "Entrées" : tab === "consult" ? "Consulter" : "Statistiques"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="container mx-auto px-4 py-6">{children}</div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Layout;
