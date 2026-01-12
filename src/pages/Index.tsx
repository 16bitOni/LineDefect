import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Settings, ClipboardCheck, Users, BarChart3, ArrowRight, Loader2 } from "lucide-react";

export default function Index() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center">
              <Settings className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg">LineDefect Tracker</span>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            variant="secondary"
            size="sm"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6 font-medium text-sm">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Manufacturing Quality Control
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Track Defects.
              <br />
              <span className="text-accent">Drive Quality.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Real-time defect tracking and 4M analysis for manufacturing lines. 
              Simple, structured, reliable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Role-Based Workflows
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Final Inspector</h3>
              <p className="text-muted-foreground">
                Log defects with photos, categories, and target zones. Instant visibility across the team.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Group Leader</h3>
              <p className="text-muted-foreground">
                Zone-based investigation. Document root causes, actions taken, and responsible manpower.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manager</h3>
              <p className="text-muted-foreground">
                Full 4M analysis. Review all zone inputs, complete analysis, and close defects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <p className="text-4xl font-bold text-accent">9</p>
              <p className="text-muted-foreground mt-1">Zones Covered</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent">4M</p>
              <p className="text-muted-foreground mt-1">Analysis Method</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent">Real-time</p>
              <p className="text-muted-foreground mt-1">Updates</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent">Mobile</p>
              <p className="text-muted-foreground mt-1">First Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            <span className="font-semibold">LineDefect Tracker</span>
          </div>
          <p className="text-sm text-primary-foreground/70">
            Manufacturing Defect Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
