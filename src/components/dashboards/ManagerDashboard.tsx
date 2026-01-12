import { useState } from "react";
import { BarChart3, Download, Loader2 } from "lucide-react";
import { DefectList } from "@/components/DefectList";
import { Button } from "@/components/ui/button";
import { exportDefectsToExcel } from "@/lib/exportExcel";
import { useToast } from "@/hooks/use-toast";

export function ManagerDashboard() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportDefectsToExcel();
      toast({
        title: "Export Complete",
        description: `Downloaded ${result.count} defects to ${result.filename}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export defects",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" />
            Defect Management
          </h2>
          <p className="text-muted-foreground">Review zone responses and perform 4M analysis</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-accent hover:bg-accent/90"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export to Excel
        </Button>
      </div>

      <DefectList showManagerAnalysis />
    </div>
  );
}
