import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { FinalInspectorDashboard } from "@/components/dashboards/FinalInspectorDashboard";
import { GroupLeaderDashboard } from "@/components/dashboards/GroupLeaderDashboard";
import { ManagerDashboard } from "@/components/dashboards/ManagerDashboard";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No role assigned. Please contact your administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        {role === "final_inspector" && <FinalInspectorDashboard />}
        {role === "group_leader" && <GroupLeaderDashboard />}
        {role === "manager" && <ManagerDashboard />}
      </main>
    </div>
  );
}
