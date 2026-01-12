import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";

export function AppHeader() {
  const { profile, role, signOut } = useAuth();

  const roleLabels = {
    final_inspector: "Final Inspector",
    group_leader: "Group Leader",
    manager: "Manager",
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center">
            <Settings className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">LineDefect Tracker</h1>
            <p className="text-xs text-primary-foreground/70">Defect Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 rounded-sm">
            <User className="w-4 h-4" />
            <div className="text-sm">
              <span className="font-medium">{profile?.name || "User"}</span>
              {role && (
                <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-sm">
                  {roleLabels[role]}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
