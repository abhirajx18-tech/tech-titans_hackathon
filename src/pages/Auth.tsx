import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Car, ParkingCircle, Shield, User as UserIcon, Users } from "lucide-react";
import { toast } from "sonner";

type AppRole = Database["public"]["Enums"]["app_role"];

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState<AppRole>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
        setSubmitting(false);
        return;
      }

      // Ensure the selected login type matches the user's actual role.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.id) {
        await supabase.auth.signOut();
        toast.error("Login failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const userId = session.user.id;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const actualRole: AppRole = (roleRow?.role as AppRole | undefined) ?? "user";

      if (actualRole !== loginRole) {
        await supabase.auth.signOut();
        toast.error(`This account is a "${actualRole}" account. Please choose "${actualRole}" login.`);
        setSubmitting(false);
        return;
      }
    } else {
      if (loginRole !== "user") {
        toast.error("Only User accounts can self-register. Staff/Admin accounts are created by the administrator.");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error.message);
      else toast.success("Check your email to confirm your account!");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <ParkingCircle className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">CampusPark</h1>
            <p className="text-sm text-muted-foreground">Smart Parking System</p>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="font-heading">{isLogin ? "Welcome back" : "Create account"}</CardTitle>
            <CardDescription>{isLogin ? "Sign in to manage parking" : "Register for campus parking"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Login as</Label>
                <RadioGroup
                  value={loginRole}
                  onValueChange={(v) => setLoginRole(v as AppRole)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3">
                    <RadioGroupItem value="user" id="role-user" />
                    <Label htmlFor="role-user" className="flex items-center gap-2 cursor-pointer w-full">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">User</span>
                      <span className="text-muted-foreground text-sm ml-auto">Book & manage reservations</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3">
                    <RadioGroupItem value="staff" id="role-staff" />
                    <Label htmlFor="role-staff" className="flex items-center gap-2 cursor-pointer w-full">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Parking Staff</span>
                      <span className="text-muted-foreground text-sm ml-auto">Check-in / check-out</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border border-border p-3">
                    <RadioGroupItem value="admin" id="role-admin" />
                    <Label htmlFor="role-admin" className="flex items-center gap-2 cursor-pointer w-full">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Admin</span>
                      <span className="text-muted-foreground text-sm ml-auto">Slots, pricing, monitoring</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {!isLogin && (
                <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              )}
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground text-sm">
          <Car className="w-4 h-4" />
          <span>Smart Campus Parking Management</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;