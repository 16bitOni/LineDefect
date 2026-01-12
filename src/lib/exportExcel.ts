import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { getPublicImageUrl } from "./imageUtils";

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

export async function exportDefectsToExcel() {
  // Fetch all defects
  const { data: defects, error: defectsError } = await supabase
    .from("defects")
    .select("*")
    .order("created_at", { ascending: false });

  if (defectsError) throw defectsError;

  // Fetch all zone responses
  const { data: zoneResponses, error: zrError } = await supabase
    .from("zone_responses")
    .select("*");

  if (zrError) throw zrError;

  // Fetch all manager analyses
  const { data: managerAnalyses, error: maError } = await supabase
    .from("manager_analysis")
    .select("*");

  if (maError) throw maError;

  // Group zone responses by defect_id
  const zrByDefect: Record<string, ZoneResponse[]> = {};
  (zoneResponses || []).forEach((zr: any) => {
    if (!zrByDefect[zr.defect_id]) {
      zrByDefect[zr.defect_id] = [];
    }
    zrByDefect[zr.defect_id].push(zr);
  });

  // Index manager analyses by defect_id
  const maByDefect: Record<string, ManagerAnalysis> = {};
  (managerAnalyses || []).forEach((ma: any) => {
    maByDefect[ma.defect_id] = ma;
  });

  // Build Excel data rows
  const rows = (defects || []).map((defect: Defect) => {
    const createdAt = new Date(defect.created_at);
    const zoneResps = zrByDefect[defect.id] || [];
    const analysis = maByDefect[defect.id];

    // Format zone analysis as a combined string
    const zoneAnalysis = zoneResps
      .map((zr) => {
        if (!zr.involved) {
          return `${zr.zone}: Not Involved`;
        }
        const parts = [`${zr.zone}: Involved`];
        if (zr.root_cause) parts.push(`Root Cause: ${zr.root_cause}`);
        if (zr.action_taken) parts.push(`Action: ${zr.action_taken}`);
        if (zr.manpower_name) parts.push(`Manpower: ${zr.manpower_name} (${zr.manpower_ein || "N/A"})`);
        return parts.join(" | ");
      })
      .join("\n");

    // Generate public URL for the image
    const imageUrl = getPublicImageUrl(defect.image_url);
    const visualEvidence = imageUrl ? imageUrl : "No Image";

    return {
      "Visual Evidence": visualEvidence,
      "Report ID": defect.report_id,
      "Date": format(createdAt, "yyyy-MM-dd"),
      "Time": format(createdAt, "HH:mm:ss"),
      "Vehicle Frame No": defect.vehicle_frame_no,
      "Model": defect.model_name,
      "Defect Category": defect.defect_category,
      "Defect Details": defect.defect_notes || "",
      "Targeted Zones": defect.targeted_zones.join(", "),
      "Zone Analysis & Findings": zoneAnalysis || "No responses yet",
      "Machine (4M)": analysis?.machine || "",
      "Method (4M)": analysis?.method || "",
      "Manpower (4M)": analysis?.manpower || "",
      "Material (4M)": analysis?.material || "",
      "Manager Name": analysis?.manager_name || "",
      "Status": defect.status,
    };
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const colWidths = [
    { wch: 40 }, // Visual Evidence
    { wch: 25 }, // Report ID
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 20 }, // Vehicle Frame No
    { wch: 20 }, // Model
    { wch: 18 }, // Defect Category
    { wch: 40 }, // Defect Details
    { wch: 25 }, // Targeted Zones
    { wch: 60 }, // Zone Analysis
    { wch: 30 }, // Machine
    { wch: 30 }, // Method
    { wch: 30 }, // Manpower
    { wch: 30 }, // Material
    { wch: 20 }, // Manager Name
    { wch: 10 }, // Status
  ];
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Defects Report");

  // Generate filename with current date
  const filename = `Defects_Report_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);

  return { count: rows.length, filename };
}
