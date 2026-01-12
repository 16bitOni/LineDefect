import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ZoneBadge } from "@/components/ZoneBadge";
import { Button } from "@/components/ui/button";
import { DefectDetail } from "@/components/DefectDetail";
import { DefectImage } from "@/components/DefectImage";
import { getPublicImageUrl } from "@/lib/imageUtils";
import { Loader2, Calendar, Car, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

type ZoneType = "L1" | "L2" | "L3" | "L4" | "R0" | "R1" | "R2" | "R3" | "R4";

interface Defect {
  id: string;
  report_id: string;
  vehicle_frame_no: string;
  model_name: string;
  defect_category: string;
  defect_notes: string | null;
  image_url: string | null;
  targeted_zones: ZoneType[];
  status: "OPEN" | "CLOSED";
  created_at: string;
}

interface DefectListProps {
  showZoneResponse?: boolean;
  showManagerAnalysis?: boolean;
}

export function DefectList({ showZoneResponse, showManagerAnalysis }: DefectListProps) {
  const { role } = useAuth();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [filter, setFilter] = useState<"all" | "OPEN" | "CLOSED">("all");

  const fetchDefects = async () => {
    try {
      const { data, error } = await supabase
        .from("defects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDefects((data as Defect[]) || []);
    } catch (error) {
      console.error("Error fetching defects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefects();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("defects-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "defects" },
        () => fetchDefects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredDefects = defects.filter((d) => 
    filter === "all" ? true : d.status === filter
  );

  if (selectedDefect) {
    return (
      <DefectDetail
        defect={selectedDefect}
        onBack={() => {
          setSelectedDefect(null);
          fetchDefects();
        }}
        showZoneResponse={showZoneResponse}
        showManagerAnalysis={showManagerAnalysis}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const openCount = defects.filter((d) => d.status === "OPEN").length;
  const closedCount = defects.filter((d) => d.status === "CLOSED").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({defects.length})
        </Button>
        <Button
          variant={filter === "OPEN" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("OPEN")}
          className={filter === "OPEN" ? "bg-status-open hover:bg-status-open/90" : ""}
        >
          Open ({openCount})
        </Button>
        <Button
          variant={filter === "CLOSED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("CLOSED")}
          className={filter === "CLOSED" ? "bg-success hover:bg-success/90" : ""}
        >
          Closed ({closedCount})
        </Button>
      </div>

      {filteredDefects.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No defects found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDefects.map((defect) => (
            <Card
              key={defect.id}
              className="cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all"
              onClick={() => setSelectedDefect(defect)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold text-sm text-accent">
                        {defect.report_id}
                      </span>
                      <StatusBadge status={defect.status} size="sm" pulse={defect.status === "OPEN"} />
                    </div>
                    <h3 className="font-semibold text-foreground truncate">
                      {defect.defect_category}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        {defect.vehicle_frame_no}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(defect.created_at), "MMM d, HH:mm")}
                      </span>
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {defect.targeted_zones.map((zone) => (
                        <ZoneBadge key={zone} zone={zone} size="sm" />
                      ))}
                    </div>
                  </div>
                  {defect.image_url && (
                    <div className="relative group">
                      <DefectImage
                        imageUrl={defect.image_url}
                        alt="Defect"
                        className="w-20 h-20 object-cover rounded-lg border"
                        fallbackClassName="w-20 h-20"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const publicUrl = getPublicImageUrl(defect.image_url);
                          if (publicUrl) {
                            window.open(publicUrl, '_blank');
                          }
                        }}
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
