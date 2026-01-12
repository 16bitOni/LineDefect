import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleCard } from "@/components/RoleCard";
import { ZoneSelector } from "@/components/ZoneBadge";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCheck, Users, BarChart3, Settings, ArrowLeft, ArrowRight } from "lucide-react";

type AppRole = "final_inspector" | "group_leader" | "manager";
type ZoneType = "L1" | "L2" | "L3" | "L4" | "R0" | "R1" | "R2" | "R3" | "R4";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    try {
      await signUp(email, password, name, selectedRole, selectedRole === "group_leader" ? selectedZone || undefined : undefined);
      toast({ title: "Account created!", description: "Welcome to LineDefect Tracker." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = email && password && name;
  const canProceedToStep3 = selectedRole !== null;
  const canSubmit = selectedRole !== null && (selectedRole !== "group_leader" || selectedZone !== null);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-4">
            <Settings className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">LineDefect Tracker</h1>
          <p className="text-muted-foreground mt-2">Manufacturing Defect Management</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader>
            <CardTitle>{isLogin ? "Sign In" : `Create Account ${!isLogin ? `(${step}/3)` : ""}`}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : step === 1
                ? "Enter your details to get started"
                : step === 2
                ? "Select your role in the production line"
                : "Select your assigned zone"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  className="w-full bg-accent hover:bg-accent/90"
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : step === 2 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <RoleCard
                    title="Final Inspector"
                    description="Log defects found at final inspection"
                    icon={ClipboardCheck}
                    selected={selectedRole === "final_inspector"}
                    onClick={() => setSelectedRole("final_inspector")}
                  />
                  <RoleCard
                    title="Group Leader"
                    description="Investigate and respond to zone defects"
                    icon={Users}
                    selected={selectedRole === "group_leader"}
                    onClick={() => setSelectedRole("group_leader")}
                  />
                  <RoleCard
                    title="Manager"
                    description="Perform 4M analysis and close defects"
                    icon={BarChart3}
                    selected={selectedRole === "manager"}
                    onClick={() => setSelectedRole("manager")}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-accent hover:bg-accent/90"
                    onClick={() => {
                      if (selectedRole === "group_leader") {
                        setStep(3);
                      } else {
                        handleSignUp();
                      }
                    }}
                    disabled={!canProceedToStep3 || isSubmitting}
                  >
                    {selectedRole === "group_leader" ? (
                      <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                    ) : isSubmitting ? (
                      "Creating account..."
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium mb-3 block">Select Your Assigned Zone</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["L1", "L2", "L3", "L4"] as ZoneType[]).map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setSelectedZone(zone)}
                        className={`py-2 px-3 rounded-sm font-mono font-semibold text-sm border-2 transition-all
                          ${selectedZone === zone 
                            ? "bg-zone-left border-zone-left text-primary-foreground" 
                            : "border-zone-left text-zone-left hover:bg-zone-left/10"}`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {(["R0", "R1", "R2", "R3", "R4"] as ZoneType[]).map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setSelectedZone(zone)}
                        className={`py-2 px-3 rounded-sm font-mono font-semibold text-sm border-2 transition-all
                          ${selectedZone === zone 
                            ? "bg-zone-right border-zone-right text-primary-foreground" 
                            : "border-zone-right text-zone-right hover:bg-zone-right/10"}`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-accent hover:bg-accent/90"
                    onClick={handleSignUp}
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setStep(1);
                  setSelectedRole(null);
                  setSelectedZone(null);
                }}
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
