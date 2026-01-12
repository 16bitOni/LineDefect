import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatusBadge } from "@/components/StatusBadge";
import { ZoneBadge } from "@/components/ZoneBadge";
import { DefectImage } from "@/components/DefectImage";
import { useToast } from "@/hooks/use-toast";
import { getPublicImageUrl } from "@/lib/imageUtils";
import { ArrowLeft, Calendar, Car, User, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
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

interface ZoneResponse {
  id: string;
  zone: ZoneType;
  involved: boolean;
  root_cause: string | null;
  action_taken: string | null;
  manpower_name: string | null;
  manpower_ein: string | null;
}

interface ManagerAnalysis {
  machine: string | null;
  method: string | null;
  manpower: string | null;
  material: string | null;
  manager_name: string | null;
}

interface DefectDetailProps {
  defect: Defect;
  onBack: () => void;
  showZoneResponse?: boolean;
  showManagerAnalysis?: boolean;
}

export function DefectDetail({
  defect,
  onBack,
  showZoneResponse,
  showManagerAnalysis,
}: DefectDetailProps) {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const [zoneResponses, setZoneResponses] = useState<ZoneResponse[]>([]);
  const [managerAnalysis, setManagerAnalysis] = useState<ManagerAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);

  // GL form state
  const [glForm, setGlForm] = useState({
    involved: true,
    rootCause: "",
    actionTaken: "",
    manpowerName: "",
    manpowerEin: "",
  });

  // Manager form state
  const [mgrForm, setMgrForm] = useState({
    machine: "",
    method: "",
    manpower: "",
    material: "",
    managerName: "",
  });

  const fetchRelatedData = async () => {
    try {
      // Fetch zone responses
      const { data: responses } = await supabase
        .from("zone_responses")
        .select("*")
        .eq("defect_id", defect.id);
      
      setZoneResponses((responses as ZoneResponse[]) || []);

      // Fetch manager analysis
      const { data: analysis } = await supabase
        .from("manager_analysis")
        .select("*")
        .eq("defect_id", defect.id)
        .maybeSingle();
      
      if (analysis) {
        setManagerAnalysis(analysis as ManagerAnalysis);
        setMgrForm({
          machine: analysis.machine || "",
          method: analysis.method || "",
          manpower: analysis.manpower || "",
          material: analysis.material || "",
          managerName: analysis.manager_name || "",
        });
      }

      // Check if GL has already responded
      if (profile?.zone && role === "group_leader") {
        const existingResponse = responses?.find(
          (r: any) => r.zone === profile.zone
        );
        if (existingResponse) {
          setGlForm({
            involved: existingResponse.involved,
            rootCause: existingResponse.root_cause || "",
            actionTaken: existingResponse.action_taken || "",
            manpowerName: existingResponse.manpower_name || "",
            manpowerEin: existingResponse.manpower_ein || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatedData();
  }, [defect.id]);

  const handleGlSubmit = async () => {
    if (!user || !profile?.zone) return;
    setIsSubmitting(true);

    try {
      const existingResponse = zoneResponses.find((r) => r.zone === profile.zone);

      if (existingResponse) {
        await supabase
          .from("zone_responses")
          .update({
            involved: glForm.involved,
            root_cause: glForm.rootCause || null,
            action_taken: glForm.actionTaken || null,
            manpower_name: glForm.manpowerName || null,
            manpower_ein: glForm.manpowerEin || null,
          })
          .eq("id", existingResponse.id);
      } else {
        await supabase.from("zone_responses").insert({
          defect_id: defect.id,
          zone: profile.zone,
          involved: glForm.involved,
          root_cause: glForm.rootCause || null,
          action_taken: glForm.actionTaken || null,
          manpower_name: glForm.manpowerName || null,
          manpower_ein: glForm.manpowerEin || null,
          created_by: user.id,
        });
      }

      toast({ title: "Response submitted", description: "Your zone response has been saved." });
      onBack();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManagerSubmit = async (newStatus: "OPEN" | "CLOSED") => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Upsert manager analysis
      const { data: existing } = await supabase
        .from("manager_analysis")
        .select("id")
        .eq("defect_id", defect.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("manager_analysis")
          .update({
            machine: mgrForm.machine || null,
            method: mgrForm.method || null,
            manpower: mgrForm.manpower || null,
            material: mgrForm.material || null,
            manager_name: mgrForm.managerName || null,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("manager_analysis").insert({
          defect_id: defect.id,
          machine: mgrForm.machine || null,
          method: mgrForm.method || null,
          manpower: mgrForm.manpower || null,
          material: mgrForm.material || null,
          manager_name: mgrForm.managerName || null,
        });
      }

      // Update defect status
      await supabase
        .from("defects")
        .update({ status: newStatus })
        .eq("id", defect.id);

      toast({
        title: `Defect ${newStatus === "CLOSED" ? "Closed" : "Updated"}`,
        description: "Your analysis has been saved.",
      });
      onBack();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userZone = profile?.zone;
  const isTargetedZone = userZone ? defect.targeted_zones.includes(userZone) : false;

  return (
    <div className="space-y-6 animate-slide-in">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
      </Button>

      {/* Defect Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-lg text-accent">{defect.report_id}</CardTitle>
            <StatusBadge status={defect.status} pulse={defect.status === "OPEN"} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {defect.image_url && (
            <div className="space-y-2">
              <DefectImage
                imageUrl={defect.image_url}
                alt="Defect"
                className="w-full max-h-64 object-contain rounded-lg border bg-muted"
                fallbackClassName="w-full h-48"
              />
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const publicUrl = getPublicImageUrl(defect.image_url);
                    if (publicUrl) {
                      window.open(publicUrl, '_blank');
                    }
                  }}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Full Image
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Frame No:</span>
                <p className="font-medium">{defect.vehicle_frame_no}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Model:</span>
                <p className="font-medium">{defect.model_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Logged:</span>
                <p className="font-medium">
                  {format(new Date(defect.created_at), "MMM d, yyyy HH:mm")}
                </p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <p className="font-medium">{defect.defect_category}</p>
            </div>
          </div>

          {defect.defect_notes && (
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Notes:</span>
              <p className="mt-1">{defect.defect_notes}</p>
            </div>
          )}

          <div>
            <span className="text-sm text-muted-foreground">Target Zones:</span>
            <div className="flex gap-2 mt-2 flex-wrap">
              {defect.targeted_zones.map((zone) => (
                <ZoneBadge key={zone} zone={zone} selected />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Responses Section */}
      {(showZoneResponse || showManagerAnalysis) && zoneResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zone Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {zoneResponses.map((resp) => (
              <div key={resp.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <ZoneBadge zone={resp.zone} selected />
                  {resp.involved ? (
                    <span className="flex items-center gap-1 text-sm text-success">
                      <CheckCircle className="w-4 h-4" /> Involved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <XCircle className="w-4 h-4" /> Not Involved
                    </span>
                  )}
                </div>
                {resp.involved && (
                  <div className="space-y-1 text-sm">
                    {resp.root_cause && (
                      <p><span className="text-muted-foreground">Root Cause:</span> {resp.root_cause}</p>
                    )}
                    {resp.action_taken && (
                      <p><span className="text-muted-foreground">Action:</span> {resp.action_taken}</p>
                    )}
                    {resp.manpower_name && (
                      <p><span className="text-muted-foreground">Manpower:</span> {resp.manpower_name} ({resp.manpower_ein})</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* GL Response Form */}
      {showZoneResponse && role === "group_leader" && userZone && (
        <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
          <Card className="border-accent/30">
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <CardTitle className="text-base flex items-center gap-2">
                    Your Zone Response
                    <ZoneBadge zone={userZone} selected />
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isFormOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={glForm.involved ? "default" : "outline"}
                    onClick={() => setGlForm({ ...glForm, involved: true })}
                    className={glForm.involved ? "bg-success hover:bg-success/90" : ""}
                    disabled={isTargetedZone && !glForm.involved}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Involved
                  </Button>
                  <Button
                    type="button"
                    variant={!glForm.involved ? "default" : "outline"}
                    onClick={() => setGlForm({ ...glForm, involved: false })}
                    disabled={isTargetedZone}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Not Involved
                  </Button>
                </div>
                {isTargetedZone && (
                  <p className="text-xs text-muted-foreground">
                    Your zone is targeted for this defect. You must respond as "Involved".
                  </p>
                )}

                {glForm.involved && (
                  <>
                    <div className="space-y-2">
                      <Label>Root Cause</Label>
                      <Textarea
                        placeholder="Describe the root cause..."
                        value={glForm.rootCause}
                        onChange={(e) => setGlForm({ ...glForm, rootCause: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Action Taken</Label>
                      <Textarea
                        placeholder="Describe actions taken..."
                        value={glForm.actionTaken}
                        onChange={(e) => setGlForm({ ...glForm, actionTaken: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Manpower Name</Label>
                        <Input
                          placeholder="Name"
                          value={glForm.manpowerName}
                          onChange={(e) => setGlForm({ ...glForm, manpowerName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Manpower EIN</Label>
                        <Input
                          placeholder="EIN"
                          value={glForm.manpowerEin}
                          onChange={(e) => setGlForm({ ...glForm, manpowerEin: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleGlSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Response
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Manager Analysis Form */}
      {showManagerAnalysis && role === "manager" && (
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="text-base">4M Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Machine</Label>
                <Textarea
                  placeholder="Machine-related factors..."
                  value={mgrForm.machine}
                  onChange={(e) => setMgrForm({ ...mgrForm, machine: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Textarea
                  placeholder="Method-related factors..."
                  value={mgrForm.method}
                  onChange={(e) => setMgrForm({ ...mgrForm, method: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Manpower</Label>
                <Textarea
                  placeholder="Manpower-related factors..."
                  value={mgrForm.manpower}
                  onChange={(e) => setMgrForm({ ...mgrForm, manpower: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Material</Label>
                <Textarea
                  placeholder="Material-related factors..."
                  value={mgrForm.material}
                  onChange={(e) => setMgrForm({ ...mgrForm, material: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Manager Name</Label>
              <Input
                placeholder="Your name"
                value={mgrForm.managerName}
                onChange={(e) => setMgrForm({ ...mgrForm, managerName: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => handleManagerSubmit("OPEN")}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1"
              >
                Save & Keep Open
              </Button>
              <Button
                onClick={() => handleManagerSubmit("CLOSED")}
                disabled={isSubmitting}
                className="flex-1 bg-success hover:bg-success/90"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Close Defect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
