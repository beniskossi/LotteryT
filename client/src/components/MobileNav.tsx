import { FC } from "react";
import { FileEdit, Copy, BarChart } from "lucide-react";

interface MobileNavProps {
  activeTab: "entries" | "consult" | "statistics";
  setActiveTab: (tab: "entries" | "consult" | "statistics") => void;
}

const MobileNav: FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="md:hidden bg-card border-t border-border shadow-lg">
      <div className="flex justify-between">
        <button
          onClick={() => setActiveTab("entries")}
          className={`flex flex-col items-center justify-center flex-1 py-3 ${
            activeTab === "entries" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <FileEdit className="h-6 w-6" />
          <span className="text-xs mt-1">Entrées</span>
        </button>

        <button
          onClick={() => setActiveTab("consult")}
          className={`flex flex-col items-center justify-center flex-1 py-3 ${
            activeTab === "consult" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Copy className="h-6 w-6" />
          <span className="text-xs mt-1">Consulter</span>
        </button>

        <button
          onClick={() => setActiveTab("statistics")}
          className={`flex flex-col items-center justify-center flex-1 py-3 ${
            activeTab === "statistics" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <BarChart className="h-6 w-6" />
          <span className="text-xs mt-1">Statistiques</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
