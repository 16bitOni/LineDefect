import { useAuth } from "@/lib/auth";
import { Users } from "lucide-react";
import { DefectList } from "@/components/DefectList";

export function GroupLeaderDashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-accent" />
          Zone Investigation
          {profile?.zone && (
            <span className="ml-2 px-3 py-1 text-sm font-mono bg-accent text-accent-foreground rounded-sm">
              {profile.zone}
            </span>
          )}
        </h2>
        <p className="text-muted-foreground">Review and respond to defects in your zone</p>
      </div>

      <DefectList showZoneResponse />
    </div>
  );
}
