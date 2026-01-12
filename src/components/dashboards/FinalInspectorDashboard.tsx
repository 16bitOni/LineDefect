import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ZoneSelector } from "@/components/ZoneBadge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Camera, Upload, ClipboardCheck } from "lucide-react";
import { DefectList } from "@/components/DefectList";

type ZoneType = "L1" | "L2" | "L3" | "L4" | "R0" | "R1" | "R2" | "R3" | "R4";

const DEFECT_CATEGORIES = [
  "Paint Defect",
  "Scratch / Dent",
  "Missing Part",
  "Wrong Assembly",
  "Electrical Issue",
  "Fit & Finish",
  "Welding Defect",
  "Other",
];

export function FinalInspectorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [formData, setFormData] = useState({
    vehicleFrameNo: "",
    modelName: "",
    defectCategory: "",
    defectNotes: "",
    targetedZones: [] as ZoneType[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.targetedZones.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one target zone.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imagePath = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("defect-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
        } else {
          // Store just the file path, not the public URL
          imagePath = fileName;
        }
      }

      // Create defect record
      const { error } = await supabase.from("defects").insert([{
        vehicle_frame_no: formData.vehicleFrameNo,
        model_name: formData.modelName,
        defect_category: formData.defectCategory,
        defect_notes: formData.defectNotes,
        targeted_zones: formData.targetedZones,
        image_url: imagePath,
        created_by: user.id,
        report_id: `DEF-${Date.now()}`,
      }]);

      if (error) throw error;

      toast({
        title: "Defect Logged",
        description: "The defect has been successfully recorded.",
      });

      // Reset form
      setFormData({
        vehicleFrameNo: "",
        modelName: "",
        defectCategory: "",
        defectNotes: "",
        targetedZones: [],
      });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log defect.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-accent" />
            Final Inspection
          </h2>
          <p className="text-muted-foreground">Log and track manufacturing defects</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Defect
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-accent/20 animate-slide-in">
          <CardHeader>
            <CardTitle>Log New Defect</CardTitle>
            <CardDescription>Record a defect found during final inspection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frameNo">Vehicle Frame No</Label>
                  <Input
                    id="frameNo"
                    placeholder="e.g., VIN12345678"
                    value={formData.vehicleFrameNo}
                    onChange={(e) => setFormData({ ...formData, vehicleFrameNo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelName">Model Name</Label>
                  <Input
                    id="modelName"
                    placeholder="e.g., Model X 2024"
                    value={formData.modelName}
                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Defect Category</Label>
                <Select
                  value={formData.defectCategory}
                  onValueChange={(value) => setFormData({ ...formData, defectCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFECT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Detailed Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe the defect in detail..."
                  value={formData.defectNotes}
                  onChange={(e) => setFormData({ ...formData, defectNotes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Defect Image</Label>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-muted rounded-lg hover:border-accent/50 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-muted rounded-lg hover:border-accent/50 transition-colors">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Take Photo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Target Zones</Label>
                <ZoneSelector
                  selected={formData.targetedZones}
                  onChange={(zones) => setFormData({ ...formData, targetedZones: zones })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging..." : "Log Defect"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DefectList key={refreshKey} />
    </div>
  );
}
